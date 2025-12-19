output "resource_group_name" {
  value = azurerm_resource_group.homelab_rg.name
}

output "location" {
  value = azurerm_resource_group.homelab_rg.location
}

output "subnet_id" {
  value = azurerm_subnet.homelab_subnet.id
}

output "nsg_id" {
  value = azurerm_network_security_group.homelab_nsg.id
}
