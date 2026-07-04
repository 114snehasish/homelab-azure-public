#!/usr/bin/env node
'use strict';

/*
 * PreToolUse guardrail: deny any tool call that touches a `.env` secrets file.
 *
 * Why: this repo's `.env` holds Azure credentials (ARM_CLIENT_ID/SECRET, ...),
 * and `main` is force-mirrored to a PUBLIC GitHub repo on every push
 * (see .github/workflows/mirror.yml). Reading `.env` into the transcript is a
 * real leak vector, so we block it at the tool boundary as defense-in-depth
 * (on top of `.env` already being gitignored).
 *
 * Contract (Claude Code hooks): receives the tool call as JSON on stdin with
 * `tool_name` and `tool_input`. To block, print a permissionDecision:"deny"
 * object to stdout and exit 0. To allow, exit 0 with no output. We deliberately
 * FAIL OPEN on any internal error so a bug here never wedges the session.
 *
 * Blocks:  .env, .env.local, .env.production, path/to/.env.anything, `cat .env`
 * Allows:  .env.example, .env.sample, .env.template (non-secret, committed
 *          scaffolding), and unrelated names like environment.md / .environment
 */

const fs = require('fs');

// A `.env` token sitting at a path/word boundary, with an optional suffix
// (.local, .production, ...). Leading boundary avoids matching e.g. "foo.env"
// inside a longer word or "environment" (there is no bare ".env" there).
const ENV_RE = /(^|[\/\\\s'"=:;,()])\.env(\.[A-Za-z0-9_-]+)?(?=$|[\/\\\s'"=:;,()])/g;

// Suffixes that denote non-secret template files we still allow.
const TEMPLATE_SUFFIXES = new Set(['example', 'sample', 'template']);

function offendingMatch(text) {
  if (typeof text !== 'string' || text.length === 0) return null;
  ENV_RE.lastIndex = 0;
  let m;
  while ((m = ENV_RE.exec(text)) !== null) {
    const suffix = m[2] ? m[2].slice(1).toLowerCase() : '';
    if (suffix && TEMPLATE_SUFFIXES.has(suffix)) continue; // template → allow
    return '.env' + (m[2] || '');
  }
  return null;
}

function candidatesFor(toolName, ti) {
  if (!ti || typeof ti !== 'object') return [];
  switch (toolName) {
    case 'Read':
    case 'Write':
    case 'Edit':
    case 'MultiEdit':
      return [ti.file_path];
    case 'NotebookEdit':
      return [ti.notebook_path, ti.file_path];
    case 'Bash':
      return [ti.command];
    case 'Grep':
      return [ti.path, ti.pattern];
    case 'Glob':
      return [ti.pattern, ti.path];
    default:
      // Unknown tool: scan any string-valued fields defensively.
      return Object.values(ti).filter((v) => typeof v === 'string');
  }
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

function main() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf-8') || '{}');
  } catch (_) {
    process.exit(0); // fail open on unreadable/malformed input
  }

  const toolName = payload.tool_name;
  const toolInput = payload.tool_input;

  for (const cand of candidatesFor(toolName, toolInput)) {
    const hit = offendingMatch(cand);
    if (hit) {
      deny(
        `Blocked by .env guardrail: "${toolName}" call references a secrets ` +
          `file (${hit}). These hold credentials and this repo is mirrored ` +
          `publicly. Use "${hit}.example" for templates, or edit the file ` +
          `outside Claude Code if you truly need to.`
      );
    }
  }

  process.exit(0); // no .env reference → allow
}

try {
  main();
} catch (_) {
  process.exit(0); // fail open on any unexpected error
}
