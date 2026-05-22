# Run in elevated PowerShell to allow LAN access to pnpm dev (ports 5173 and 1337).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/dev-firewall-windows.ps1

$rules = @(
	@{ Name = "Kaneo Dev API (1337)"; Port = 1337 },
	@{ Name = "Kaneo Dev Web (5173)"; Port = 5173 }
);

foreach ($rule in $rules) {
	$existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue;
	if ($existing) {
		Write-Host "Rule already exists: $($rule.Name)";
		continue;
	}
	New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $rule.Port | Out-Null;
	Write-Host "Added firewall rule: $($rule.Name)";
}

Write-Host "Done. Test from another device: curl http://<your-lan-ip>:1337/api/health"
