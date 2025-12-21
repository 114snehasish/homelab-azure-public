# Homelab Azure Infrastructure

This repository contains the Terraform infrastructure for the Homelab.
It has been modularized to allow independent lifecycle management of resources.

## Modules

### 1. `infra/network` (Persistent)
Contains the "skeleton" of the infrastructure:
- Resource Group (`homelab-rg`)
- Virtual Network (`homelab-vnet`)
- Subnet (`homelab-subnet`)
- Network Security Group (`homelab-nsg-for-vm`)

**Run this first.** These resources are persistent and rarely change.

### 2. `infra/storage` (Persistent)
Contains persistent data resources:
- Managed Data Disk (`homelab-data-disk`)

**Run this second.** This disk persists independently of the VM to ensure data safety.

### 3. `compute/vm` (Ephemeral)
Contains the compute resources:
- Virtual Machine (`homelab-vm`)
- Network Interface (`homelab-vm-nic`)
- Public IP (`homelab-vm-public-ip`)

**Run this last.** You can destroy and recreate this module freely. The Data Disk from `infra/storage` will be automatically re-attached.

## Usage

### Prerequisites
- Azure CLI installed and logged in (`az login`).
- Terraform installed.

### Deploying
Run the following commands in order:

```bash
# 1. Deploy Network
cd infra/network
terraform init
terraform apply

# 2. Deploy Storage
cd ../../infra/storage
terraform init
terraform apply

# 3. Deploy Compute
cd ../../compute/vm
terraform init
terraform apply
```

### Destroying
To save costs (destroy VM/IP) but keep data/network:

```bash
cd compute/vm
terraform destroy
```

To destroy EVERYTHING (Danger Zone):
```bash
# Destroy in reverse order
cd compute/vm && terraform destroy
cd ../../infra/storage && terraform destroy
cd ../../infra/network && terraform destroy
```

## CI/CD
GitHub Actions workflows are provided in `.github/workflows/` to automate deployment on push to `main`.
Ensure the following Secrets are set in your GitHub Repository:
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
