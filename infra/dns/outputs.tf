output "name_servers" {
  description = "The name servers of the DNS zone"
  value       = azurerm_dns_zone.homelab.name_servers
}

output "dns_zone_id" {
  description = "The ID of the DNS zone"
  value       = azurerm_dns_zone.homelab.id
}

output "dns_zone_name" {
  description = "The name of the DNS zone"
  value       = azurerm_dns_zone.homelab.name
}

output "resource_group_name" {
  description = "The name of the resource group"
  value       = data.azurerm_resource_group.dns_rg.name
}
