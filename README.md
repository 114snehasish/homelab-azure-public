# Azure Homelab Setup

This repository contains the configuration files and scripts to set up an Azure Homelab using Terraform and GitHub Actions.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) installed
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [GitHub CLI](https://cli.github.com/) installed
- An Azure account
- A GitHub account

## Repository Structure

- `main.tf`: Main Terraform configuration file
- `variables.tf`: Variables used in the Terraform configuration
- `outputs.tf`: Outputs of the Terraform configuration
- `.github/workflows/`: Directory containing GitHub Actions workflows

## Setup Instructions

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/homelab-azure.git
    cd homelab-azure
    ```

2. **Configure Azure CLI:**
    ```sh
    az login
    ```

3. **Initialize Terraform:**
    ```sh
    terraform init
    ```

4. **Apply Terraform configuration:**
    ```sh
    terraform apply
    ```

5. **Set up GitHub Actions:**
    - Create a new repository on GitHub and push your code.
    - Add the following secrets to your GitHub repository:
        - `AZURE_CLIENT_ID`
        - `AZURE_CLIENT_SECRET`
        - `AZURE_SUBSCRIPTION_ID`
        - `AZURE_TENANT_ID`

## GitHub Actions Workflow

The GitHub Actions workflow is defined in `.github/workflows/terraform.yml`. It automates the deployment of your Azure resources using Terraform.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, please open an issue or contact me at [your-email@example.com].
