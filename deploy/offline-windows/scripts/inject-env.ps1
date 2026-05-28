$ErrorActionPreference = "Stop"
$WebRoot = if ($args.Count -ge 1 -and $args[0]) { $args[0] } else { "C:\kaneo\web\dist" }
$api = $env:KANEO_API_URL
$client = $env:KANEO_CLIENT_URL
if (-not $api) { throw "KANEO_API_URL is not set (e.g. http://localhost:5173/api)" }
if (-not (Test-Path -LiteralPath $WebRoot)) { throw "Web root not found: $WebRoot" }
$count = 0
Get-ChildItem -LiteralPath $WebRoot -Filter *.js -Recurse -File | ForEach-Object {
  $content = [System.IO.File]::ReadAllText($_.FullName)
  $updated = $content.Replace("KANEO_API_URL", $api)
  if ($client) { $updated = $updated.Replace("KANEO_CLIENT_URL", $client) }
  if ($updated -ne $content) {
    [System.IO.File]::WriteAllText($_.FullName, $updated)
    $count++
  }
}
Write-Host "Updated $count JS file(s) under $WebRoot"