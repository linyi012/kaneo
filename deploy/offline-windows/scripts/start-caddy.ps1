$ErrorActionPreference = "Stop"
$KaneoRoot = if ($env:KANEO_ROOT) { $env:KANEO_ROOT } else { "C:\kaneo" }
$CaddyExe = Join-Path $KaneoRoot "caddy\caddy.exe"
$Caddyfile = Join-Path $KaneoRoot "config\Caddyfile"
if (-not (Test-Path -LiteralPath $CaddyExe)) {
  throw "Missing $CaddyExe - download caddy.exe and place it in C:\kaneo\caddy\"
}
Set-Location (Join-Path $KaneoRoot "caddy")
& $CaddyExe run --config $Caddyfile