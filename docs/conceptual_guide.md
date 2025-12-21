# Hacking the Cloud: My Guide to a Persistent Homelab

I wrote this guide to explain the architectural decisions behind my Terraform project. I want to demystify "grey area" concepts like Storage Persistence, Cloud-Init, and Infrastructure as Code state management that I encountered while building this.

---

## 1. My Core Philosophy: "Cattle, Not Pets"

In the old days, I treated servers like "Pets". I named them (e.g., `zeus`, `apollo`), manually updated them, and if they crashed, it was a disaster.
In the cloud, I treat my servers like "Cattle". They are numbered, identical, and if one gets sick, I simply replace it with a new one.

**How I implemented this:**
- **My VM is Ephemeral**: I can destroy (`terraform destroy`) and recreate (`terraform apply`) the Virtual Machine at any time. I don't care about the specific instance running Ubuntu.
- **My Data is Persistent**: I care deeply about my data (Docker containers, volumes). This led me to adopt the **Split Disk Strategy**.

---

## 2. My Storage Persistence Strategy

### The Problem
When I run a default Azure VM, it comes with an **OS Disk**. If I delete the VM, Azure deletes the OS Disk by default. If I installed Docker and ran containers on that OS Disk, they would be gone forever.

### My Solution: "Brain Transplant"
I decided to separate the "Brain" (OS/Compute) from the "Memory" (Data).

1.  **Ephemeral OS Disk (`/dev/sda`)**:
    - Created by my `compute/vm` module.
    - Contains Ubuntu 24.04 and the Docker Engine binaries.
    - **Fate**: Destroyed on every redeploy.

2.  **Persistent Data Disk (`/dev/sdc`)**:
    - Created by my `infra/storage` module.
    - A Managed Disk (Standard SSD) that exists *independently* of the VM.
    - **Fate**: Persists forever (I marked it with `prevent_destroy = true`).

### Terraform Implementation
In `infra/storage/main.tf`, I create the disk:
```hcl
resource "azurerm_managed_disk" "homelab_data_disk" {
  name                 = "homelab-data-disk"
  ...
}
```

In `compute/vm/main.tf`, I *attach* that existing disk to my new VM:
```hcl
resource "azurerm_virtual_machine_data_disk_attachment" "attach" {
  managed_disk_id    = var.data_disk_id # Passed from storage module
  virtual_machine_id = azurerm_linux_virtual_machine.homelab_vm.id
  lun                = 10 # Logical Unit Number 10
}
```

---

## 3. Cloud-Init: My Bootstrapper

When I boot up a new VM for the first time, it has a blank OS and a raw, unformatted data disk attached to it. It doesn't know it's supposed to be a Docker host.
**Cloud-Init** is the script I use to bridge this gap. It runs once on the very first boot.

### The Problem it Solves
1.  **Format the Disk**: The Data Disk is raw bytes. Linux needs a filesystem (ext4) to write files.
2.  **Mount the Disk**: Linux needs to know *where* to put this disk.
3.  **Install Docker**: The OS is empty.

### My Script (`cloud-init.yaml`)
I use a robust "Inline Script" approach in the `runcmd` section.

#### Step A: Disk Discovery (The "LUN 10" Trick)
Device names in Linux (`/dev/sdc`, `/dev/sdd`) can change uncontrollably. However, Azure guarantees the **LUN** (Logical Unit Number).
My script finds the disk by LUN 10:
```bash
if [ -e /dev/disk/azure/scsi1/lun10 ]; then
  DISK=$(readlink -f /dev/disk/azure/scsi1/lun10)
fi
```

#### Step B: Safe Formatting
I check if the disk is already formatted (from a previous life).
- **If New**: Run `mkfs.ext4` (Format it).
- **If Existing**: Skip formatting! (Preserve my data).
This check makes my script **Idempotent**.

#### Step C: The "Volume Persistence" Hack
I mount the persistent disk to `/data`.
```bash
mount /dev/sdc1 /data
```
**Why?**
Instead of trying to persist the entire fragile Docker engine state, I just persist the data.
I run my containers with volume mappings (e.g., `-v /data/myapp:/app_data`).
This keeps my data safe on the persistent disk, while the containers themselves remain ephemeral and disposable.

---

## 4. Terraform State: My Memory of the World

Terraform needs to know what it created. It stores this in a file called `terraform.tfstate`.

### Local vs. Remote State
- **Local**: Stored on my laptop. If my laptop crashes, I lose control of my cloud.
- **Remote (My Setup)**: Stored in an Azure Storage Account (`listeninfratfstatesa`).

### Implementation
I gave each module its own state file to prevent conflicts:
- `infra/network` -> `homelab.network.tfstate`
- `infra/storage` -> `homelab.storage.tfstate`
- `compute/vm`    -> `homelab.compute.tfstate`

This allows me to destroy the **VM** (Compute state) without touching my **Network** or **Storage** state.
