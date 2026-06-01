param(
	[string]$WebRoot = "",
	[string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"

$DefaultWebRoot = "C:\kaneo\web\dist"
$DefaultAppName = "Kaneo"
$DefaultTagline = "All you need. Nothing you don't."

if (-not $WebRoot) {
	$WebRoot = $DefaultWebRoot
}

if (-not $EnvFile) {
	$EnvFile = Join-Path (Split-Path (Split-Path $WebRoot -Parent) -Parent) ".env"
}

function Read-DotEnvFile {
	param([string]$Path)

	$vars = @{}
	if (-not (Test-Path -LiteralPath $Path)) {
		return $vars
	}

	Get-Content -LiteralPath $Path | ForEach-Object {
		$line = $_.Trim()
		if (-not $line -or $line.StartsWith("#")) {
			return
		}
		$eq = $line.IndexOf("=")
		if ($eq -lt 1) {
			return
		}
		$key = $line.Substring(0, $eq).Trim()
		$value = $line.Substring($eq + 1).Trim()
		if (
			($value.StartsWith('"') -and $value.EndsWith('"')) -or
			($value.StartsWith("'") -and $value.EndsWith("'"))
		) {
			$value = $value.Substring(1, $value.Length - 2)
		}
		$vars[$key] = $value
	}

	return $vars
}

function Apply-Replacements {
	param(
		[string]$Content,
		[hashtable]$Replacements
	)

	$updated = $Content
	foreach ($key in $Replacements.Keys) {
		$updated = $updated.Replace($key, $Replacements[$key])
	}
	return $updated
}

if (-not (Test-Path -LiteralPath $WebRoot)) {
	throw "Web root not found: $WebRoot"
}

$envVars = Read-DotEnvFile -Path $EnvFile
foreach ($key in $envVars.Keys) {
	if (-not [string]::IsNullOrWhiteSpace($envVars[$key])) {
		Set-Item -Path "env:$key" -Value $envVars[$key]
	}
}

$api = $env:KANEO_API_URL
if (-not $api -and $envVars.ContainsKey("KANEO_API_URL")) {
	$api = $envVars["KANEO_API_URL"]
}
if (-not $api) {
	throw "KANEO_API_URL is not set in $EnvFile (e.g. http://localhost:5173/api)"
}

$client = $env:KANEO_CLIENT_URL
if (-not $client -and $envVars.ContainsKey("KANEO_CLIENT_URL")) {
	$client = $envVars["KANEO_CLIENT_URL"]
}

$appName = $env:KANEO_APP_NAME
if (-not $appName -and $envVars.ContainsKey("KANEO_APP_NAME")) {
	$appName = $envVars["KANEO_APP_NAME"]
}
if (-not $appName) {
	$appName = $DefaultAppName
}

$tagline = $env:KANEO_APP_TAGLINE
if (-not $tagline -and $envVars.ContainsKey("KANEO_APP_TAGLINE")) {
	$tagline = $envVars["KANEO_APP_TAGLINE"]
}
if (-not $tagline) {
	$tagline = $DefaultTagline
}

$replacements = [ordered]@{
	# Must run before bare KANEO_APP_NAME (substring of the token below).
	"@@KANEO_APP_NAME@@" = $appName
	"KANEO_API_URL" = $api
	"KANEO_APP_NAME" = $appName
	"KANEO_APP_TAGLINE" = $tagline
}
if ($client) {
	$replacements["KANEO_CLIENT_URL"] = $client
}

Write-Host "Env file: $EnvFile"
Write-Host "Web root: $WebRoot"
Write-Host "KANEO_API_URL=$api"
if ($client) { Write-Host "KANEO_CLIENT_URL=$client" }
Write-Host "KANEO_APP_NAME=$appName"
Write-Host "KANEO_APP_TAGLINE=$tagline"

$jsCount = 0
Get-ChildItem -LiteralPath $WebRoot -Filter *.js -Recurse -File | ForEach-Object {
	$content = [System.IO.File]::ReadAllText($_.FullName)
	$updated = Apply-Replacements -Content $content -Replacements $replacements
	if ($updated -ne $content) {
		[System.IO.File]::WriteAllText($_.FullName, $updated)
		$jsCount++
	}
}

$htmlCount = 0
foreach ($relativePath in @("index.html", "site.webmanifest")) {
	$filePath = Join-Path $WebRoot $relativePath
	if (-not (Test-Path -LiteralPath $filePath)) {
		continue
	}
	$content = [System.IO.File]::ReadAllText($filePath)
	$updated = Apply-Replacements -Content $content -Replacements $replacements
	if ($updated -ne $content) {
		[System.IO.File]::WriteAllText($filePath, $updated)
		$htmlCount++
	}
}

Write-Host "Updated $jsCount JS file(s) and $htmlCount static file(s) under $WebRoot"
