$ErrorActionPreference = "Stop"
$KaneoRoot = if ($env:KANEO_ROOT) { $env:KANEO_ROOT } else { "C:\kaneo" }
$EnvFile = Join-Path $KaneoRoot ".env"
if (Test-Path -LiteralPath $EnvFile) {
  Get-Content -LiteralPath $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
  }
}
Set-Location (Join-Path $KaneoRoot "apps\api")
$env:NODE_ENV = "production"
& node --enable-source-maps .\dist\index.js