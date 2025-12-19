variable "location" {
  type    = string
  default = "southindia"
}

variable "rg_name" {
  type    = string
  default = "homelab-rg"
}

variable "ssh_source_ip" {
  description = "The IP address allowed to SSH into the VM. If not provided, it defaults to the machine running Terraform."
  type        = string
  default     = null
}
