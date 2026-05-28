param(
	[string]$OutputDir = "",
	[switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
if (-not $OutputDir) {
	$OutputDir = $RepoRoot
}

$Version = (Get-Content (Join-Path $RepoRoot "package.json") -Raw | ConvertFrom-Json).version
$Root = Join-Path $RepoRoot ".release\kaneo"
$ZipPath = Join-Path $OutputDir ("kaneo-offline-win-x64-v" + $Version + "-api-web.zip")

function Remove-TreeSafe($Path) {
	if (-not (Test-Path $Path)) {
		return
	}
	try {
		cmd /c "rmdir /s /q `"$Path`"" | Out-Null
	}
	catch {
		Write-Warning "Could not remove ${Path}: $_"
	}
}

Write-Host "==> Repo: $RepoRoot"
Write-Host "==> Zip:  $ZipPath"

Push-Location $RepoRoot
try {
	if (-not $SkipBuild) {
		Write-Host "==> Install + build (email is required by API; api + web)"
		corepack enable 2>$null
		corepack prepare pnpm@10.32.1 --activate
		pnpm install --frozen-lockfile
		pnpm --filter @kaneo/email --filter @kaneo/api --filter @kaneo/web run build
	}

	if (-not (Test-Path "apps\api\dist\index.js")) {
		throw "Missing apps\api\dist   run without -SkipBuild first"
	}
	if (-not (Test-Path "apps\web\dist\index.html")) {
		throw "Missing apps\web\dist   run without -SkipBuild first"
	}

	Remove-TreeSafe $Root
	New-Item -ItemType Directory -Force -Path @(
		"$Root\apps\api\data",
		"$Root\web\dist",
		"$Root\packages\email",
		"$Root\packages\typescript-config",
		"$Root\packages\libs",
		"$Root\caddy",
		"$Root\config",
		"$Root\scripts"
	) | Out-Null

	Write-Host "==> Stage files"
	# Create a minimal package.json and install with npm so the resulting node_modules
	# is self-contained (no pnpm store links) for fully offline target machines.
	$apiPkg = Get-Content (Join-Path $RepoRoot "apps\api\package.json") -Raw | ConvertFrom-Json
	$rootPkg = Get-Content (Join-Path $RepoRoot "package.json") -Raw | ConvertFrom-Json

	$deps = @{}
	foreach ($p in $apiPkg.dependencies.PSObject.Properties) {
		if ($p.Name -eq "@kaneo/email") { continue }
		$deps[$p.Name] = $p.Value
	}
	# API imports dotenv-mono from the root workspace in this repo.
	if (-not $deps.ContainsKey("dotenv-mono")) {
		$deps["dotenv-mono"] = $rootPkg.dependencies."dotenv-mono"
	}
	# Use local built email package as a file dependency.
	$deps["@kaneo/email"] = "file:packages/email"

	$stagePkg = [ordered]@{
		name = "kaneo-offline"
		private = $true
		type = "module"
		version = $Version
		dependencies = $deps
	}
	$stagePkgJson = ($stagePkg | ConvertTo-Json -Depth 20)
	Set-Content -Path (Join-Path $Root "package.json") -Value $stagePkgJson -Encoding UTF8

	Copy-Item apps\api\dist, apps\api\drizzle "$Root\apps\api\" -Recurse
	Copy-Item packages\email\package.json "$Root\packages\email\"
	Copy-Item packages\email\dist "$Root\packages\email\dist" -Recurse
	Copy-Item packages\typescript-config\package.json "$Root\packages\typescript-config\"
	Copy-Item packages\libs\package.json "$Root\packages\libs\"
	Copy-Item apps\web\dist\* "$Root\web\dist\" -Recurse
	Copy-Item "$ScriptDir\config\*" "$Root\config\"
	Copy-Item "$ScriptDir\scripts\*" "$Root\scripts\"
	Copy-Item "$ScriptDir\README.md" "$Root\DEPLOY.md"

	Write-Host "==> Production dependencies (npm; self-contained node_modules)"
	Push-Location $Root
	try {
		$env:NODE_ENV = "production"
		# Generate package-lock for reproducibility (not required by target).
		npm install --omit=dev
	}
	finally {
		Pop-Location
	}

	if (Test-Path $ZipPath) {
		Remove-Item $ZipPath -Force
	}
	Write-Host "==> Compress (tar; avoids Compress-Archive path limits)"
	Push-Location (Join-Path $RepoRoot ".release")
	try {
		tar.exe -a -cf $ZipPath kaneo
	}
	finally {
		Pop-Location
	}

	$mb = [math]::Round((Get-Item $ZipPath).Length / 1MB, 1)
	Write-Host "DONE: $ZipPath ($mb MB)"
}
finally {
	Pop-Location
}
