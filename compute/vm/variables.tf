variable "rg_name" {
  type    = string
  default = "homelab-rg"
}

variable "location" {
  type    = string
  default = "southindia"
}

variable "vnet_name" {
  type    = string
  default = "homelab-vnet"
}

variable "subnet_name" {
  type    = string
  default = "homelab-subnet"
}

variable "nsg_name" {
  type    = string
  default = "homelab-nsg-for-vm"
}

variable "disk_name" {
  type    = string
  default = "homelab-data-disk"
}

variable "ssh_key_name" {
  type    = string
  default = "homelab-vm-ssh-key-2"
}
