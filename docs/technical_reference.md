# Technical Reference: My Modular Azure Homelab

This document serves as the technical API reference for the Terraform modules in my project.

---

## 1. My Project Structure

```
.
├── compute
│   └── vm          # [Ephemeral] Virtual Machine, NIC, Public IP
├── infra
│   ├── network     # [Persistent] VNet, Subnet, NSG, Resource Group
│   └── storage     # [Persistent] Managed Data Disks
├── .github
│   └── workflows   # CI/CD Pipelines
└── docs            # Documentation
```

---

## 2. Module: `infra/network`

**Purpose**: Sets up the foundational networking and resource grouping. I designed these resources to be rarely changed or destroyed.

### Resources
- `azurerm_resource_group.homelab_rg`: The container for all my resources.
- `azurerm_virtual_network.homelab_vnet`: My private network (10.0.0.0/16).
- `azurerm_subnet.homelab_subnet`: The subnet for my VMs (10.0.1.0/24).
- `azurerm_network_security_group.homelab_nsg`: Firewall rules (I allow SSH but deny others).

### Inputs (`variables.tf`)
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `rg_name` | string | `homelab-rg` | Name of the Resource Group |
| `location` | string | `southindia` | Azure Region |
| `ssh_source_ip` | string | `*` | IP Whitelist for SSH access (My Security Best Practice) |

### Outputs (`outputs.tf`)
- `subnet_id`: ID of the subnet (Constructed via data source in dependent modules).
- `nsg_id`: ID of the Network Security Group.
- `rg_name`: Name of the resource group.

---

## 3. Module: `infra/storage`

**Purpose**: Manages persistent stateful resources. This layer must survive when I destroy the VM.

### Resources
- `azurerm_managed_disk.homelab_data_disk`: A Standard SSD Managed Disk (Size: 20GB).
  - **Lifecycle**: `prevent_destroy = true` triggers are active to protect my data. 
  - **Type**: `StandardSSD_LRS` (I chose this as it is cost-effective but performant).

### Inputs (`variables.tf`)
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `disk_name` | string | `homelab-data-disk` | Name of the persistent disk |
| `disk_size_gb` | number | `20` | Size in GB |

### Outputs (`outputs.tf`)
- `disk_id`: The ID required to attach this disk to a VM.

---

## 4. Module: `compute/vm`

**Purpose**: The compute workload. I designed this to be disposable.

### Resources
- `azurerm_public_ip.vm_public_ip`: Dynamic Public IP for internet access.
- `azurerm_network_interface.vm_nic`: Connects VM to Subnet and NSG.
- `azurerm_linux_virtual_machine.homelab_vm`: The Ubuntu 24.04 Server.
- `azurerm_virtual_machine_data_disk_attachment`: Connects the disk from `infra/storage` to this VM at **LUN 10**.

### Configuration via `cloud-init.yaml`
This module injects a script that I wrote to:
1. Wait for LUN 10 presence.
2. Check for existing filesystem (idempotent format).
3. Mount the disk to `/data`.
4. Install Docker Engine.

### Inputs (`variables.tf`)
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `vm_size` | string | `Standard_B2s` | Azure VM Size |
| `data_disk_name` | string | `homelab-data-disk` | Name of existing disk to find and attach |

---

## 5. CI/CD Workflows

Pipelines are located in `.github/workflows/`:
1.  **`deploy-network.yml`**: Deploys `infra/network`.
2.  **`deploy-storage.yml`**: Deploys `infra/storage`.
3.  **`deploy-compute.yml`**: Deploys `compute/vm`.

**Triggers**:
- `push`: Runs `terraform plan`.
- `workflow_dispatch`: Runs `terraform apply` (requires me to check `apply: true`).
