# Kaneo Windows offline package (API + Web)

## Contents

- `apps/api` — API (`dist`, `drizzle`, production `node_modules` at repo root)
- `web/dist` — static frontend
- `packages/email` — required by API at runtime (auth / notification mail)
- `config/`, `scripts/` — Caddy + startup helpers

Not included: `apps/mcp`, `apps/site`, `packages/mcp`.

## Target machine prerequisites

1. **Node.js** 20.19+ (x64)
2. **PostgreSQL** 16+
3. **caddy.exe** in `C:\kaneo\caddy\` ([releases](https://github.com/caddyserver/caddy/releases))
4. Optional: **MinIO** for image uploads (`S3_*` in `.env`)

## Install

1. Extract zip to `C:\kaneo`
2. Copy `config\env.example` → `C:\kaneo\.env` and edit
3. Generate `AUTH_SECRET` (required; must be stable across restarts):

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
```

Put the output into `C:\kaneo\.env`:

```env
AUTH_SECRET=<paste-generated-value-here>
```

4. Inject frontend configuration from `.env` (URLs and optional branding):

```powershell
C:\kaneo\scripts\inject-env.ps1
```

The script reads `C:\kaneo\.env` automatically. It replaces placeholders in `web/dist` for:

- `KANEO_API_URL`, `KANEO_CLIENT_URL` (required)
- `KANEO_APP_NAME`, `KANEO_APP_TAGLINE` (optional; default to Kaneo branding)

Re-run inject after changing `.env` values (no need to export environment variables manually).

Optional custom web root or env file:

```powershell
C:\kaneo\scripts\inject-env.ps1 -WebRoot C:\kaneo\web\dist -EnvFile C:\kaneo\.env
```

5. Start API, then Caddy:

```powershell
C:\kaneo\scripts\start-api.ps1
# new window:
C:\kaneo\scripts\start-caddy.ps1
```

6. Open http://localhost:5173

## Verify

```powershell
Invoke-WebRequest http://127.0.0.1:1337/api/health -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:5173/api/health -UseBasicParsing
```

Build this package on **Windows x64** (same OS as the offline target).
