---
name: tf-plan
description: Run the Terraform pre-flight (fmt check, init, validate, plan) for one homelab module or all five in dependency order. Use before committing Terraform changes or when asked to plan/preview infrastructure changes. Pass a module path (e.g. "compute/vm") or "all".
---

Run a consistent Terraform pre-flight for this repo's root modules.

## Input

`$ARGUMENTS` is a module directory or `all` (default: the module(s) touched by the current diff; if none, ask).

Dependency order for `all`: `infra/network` → `infra/dns` → `infra/cloudflare` → `infra/storage` → `compute/vm`.

## Environment

Before running, export Azure credentials from the gitignored root `.env` (contains `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID`):

```bash
set -a; source .env; set +a
```

- `infra/cloudflare` additionally needs `TF_VAR_cloudflare_api_token` and `TF_VAR_cloudflare_zone_id` — if unset, tell the user and skip that module rather than letting the plan prompt/hang.
- `infra/dns` and `compute/vm` need `terraform.tfvars` (copy from `terraform.tfvars.example` if missing — ask the user for values, never invent them).

## Steps (per module, from the repo root)

```bash
terraform -chdir=<module> fmt -check -recursive
terraform -chdir=<module> init -input=false
terraform -chdir=<module> validate
terraform -chdir=<module> plan -input=false
```

- If `fmt -check` fails, run `terraform -chdir=<module> fmt -recursive` and note which files changed.
- NEVER run `terraform apply` or `terraform destroy` from this skill — plan only.
- Expected noise: the `infra/network` plan shows a diff on the NSG SSH rule whenever the caller's public IP changed (it's fetched live from api.ipify.org). Point this out instead of treating it as a real change.

## Report

Summarize per module: fmt/validate status and the plan's add/change/destroy counts, calling out anything destructive.
