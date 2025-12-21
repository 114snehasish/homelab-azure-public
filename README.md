# My Homelab on Azure with Terraform

This project allows me to provision a modular, persistent homelab environment on Azure using Terraform and GitHub Actions. I built this to have full control over my infrastructure with the ability to destroy and recreate compute resources without losing my data.

## 📚 Documentation

I have put comprehensive documentation under the `docs/` directory to help you understand my setup:

- **[📖 Conceptual Guide](docs/conceptual_guide.md)**  
  *Read this first!* Here I explain the "Why" and "How" behind my architectural decisions, including:
  - My "Cattle, Not Pets" philosophy.
  - How I persist Docker data even when destroying the VM ("Split Disk Strategy").
  - How I use `cloud-init` to automate the bootstrapping process.

- **[⚙️ Technical Reference](docs/technical_reference.md)**  
  My personal API reference for the codebase. I listed all Modules, Resources, Variables, and Outputs that I use.

## 🚀 Quick Start

### Prerequisites
- Azure CLI
- Terraform v1.x
- GitHub Account (for my CI/CD pipelines)

### Deployment Order
Since I designed this as a modular architecture, I must create resources in this specific dependency order:

1.  **Network** (`infra/network`)  
    I start here to create the VNet and Resource Group.
    ```bash
    cd infra/network
    terraform init
    terraform apply
    ```

2.  **Storage** (`infra/storage`)  
    Next, I create the Persistent Data Disk.
    ```bash
    cd ../../infra/storage
    terraform init
    terraform apply
    ```

3.  **Compute** (`compute/vm`)  
    Finally, I spin up the VM, attach my disk, and install Docker.
    ```bash
    cd ../../compute/vm
    terraform init
    terraform apply
    ```

### Verification
Once deployed, I SSH into my VM (`terraform output ssh_command`) and check that Docker is running and my persistence strategy is active. See [Walkthrough Artifact](.gemini/antigravity/brain/c804c037-79cb-410f-be72-bd4f1152b3bb/walkthrough.md) for details.

### CI/CD
I manage my deployments via GitHub Actions in `.github/workflows/`. I make sure variables `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, and `ARM_TENANT_ID` are set in my GitHub Secrets.
