# Building the Bedrock: My Guide to a Scalable Homelab Foundation

This guide explains the architectural decisions I made while building the **foundational layer** of my homelab.

While the current infrastructure might look simple—a VM, a disk, a network—it is deliberately architected to support the complex, data-intensive ecosystem I plan to build on top of it. This isn't the final product; it's the stable platform that everything else will stand on.

---

## 1. My Core Philosophy: Preparing for Scale

In my future plans (which involve complex services and topologies), individual servers will be disposable assets. I need to be comfortable destroying and rebuilding them without a second thought.

To prepare for this, I adopted the **"Cattle, Not Pets"** philosophy from Day 1:
- I treat my current VM as a disposable node, anticipating a future where I might have clusters of them.
- I enforced a strict separation of concerns now, so I don't get blocked by monolithic technical debt later.

---

## 2. The Persistence Architecture

### The Long-Term Challenge
As I add databases and services later, data integrity will become my biggest risk. I realized that if I tied my data to my compute nodes now, I would be painting myself into a corner.

### My Solution: The "Split Disk" Primitive
I implemented a pattern I call "Brain Transplant"—decoupling the OS from the Data.

1.  **Metric of Success**: I must be able to nuke the entire compute layer and lose nothing but CPU cycles.
2.  **Implementation**: 
    - My **Storage Module** creates the "Memory" (Managed Disks) as a permanent fixture.
    - My **Compute Module** allows me to plug this memory into any new "Brain" (VM) I spin up.
    
This primitive is simple now, but it paves the way for advanced stateful workloads in the future.

---

## 3. Cloud-Init: Automated Bootstrapping

Manually configuring servers is a bottleneck that doesn't scale. To ensure I can expand this lab effortlessly, I invested in **Cloud-Init** automation early.

### The Strategy
I use `cloud-init` to enforce a standard "Contract" that every new node must fulfill before it joins my lab:
1.  **Identify Resources**: Automatically discover attached storage (using stable LUN identifiers).
2.  **Self-Repair**: Check if existing data structures (filesystems) allow for immediate resumption of work.
3.  **Mount & Serve**: Expose the persistent data to the application layer (Docker).

By solving this automation challenge now, I ensure that any future node—whether it's my second or my fiftieth—just works.

---

## 4. Terraform State: Modular Isolation

I knew a monolithic state file would become a nightmare as my project grew. 

To prevent this, I established a **Modular State Architecture** from the start. I gave every functional domain (`network`, `storage`, `compute`) its own isolated state file.
This means I can heavily modify or even break my Compute layer without ever risking the stability of my Network or Storage layers. This isolation is key to the rapid experimentation I have planned.
