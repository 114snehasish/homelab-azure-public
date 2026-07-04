variable "rg_name" {
  description = "The name of the resource group for DNS"
  type        = string
  default     = "homelab-rg"
}

variable "location" {
  description = "The Azure region to deploy to"
  type        = string
  default     = "East US"
}

variable "dns_zone_name" {
  description = "The DNS zone name"
  type        = string
}
