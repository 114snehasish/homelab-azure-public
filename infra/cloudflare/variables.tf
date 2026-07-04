variable "cloudflare_api_token" {
  description = "The Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "The Cloudflare Zone ID for the root domain"
  type        = string
}

variable "azure_dns_zone_name" {
  description = "The Azure DNS Zone name to delegate to"
  type        = string
}

variable "azure_rg_name" {
  description = "The Resource Group name where Azure DNS Zone resides"
  type        = string
  default     = "homelab-rg"
}
