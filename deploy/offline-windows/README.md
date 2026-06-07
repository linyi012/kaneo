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

## Database

When configuring PostgreSQL, set the server default timezone to **UTC**. Kaneo stores and compares timestamps in UTC; a non-UTC database timezone can cause incorrect dates and recurring-task schedules.

**Recommended (per database):**

```sql
ALTER DATABASE kaneo SET timezone TO 'UTC';
```

**Alternatively**, set `timezone = 'UTC'` in `postgresql.conf` and restart PostgreSQL.

Verify:

```sql
SHOW timezone;
-- UTC
```

### Default recurring-task schedule (new workspaces)

Recurring tasks (RRule) use each workspace’s schedule when a rule is **created** in the UI. If a workspace never opens **Settings → RRule schedule**, Kaneo falls back to column defaults on `workspace`:

| Column | Default (shipped) | Meaning |
|--------|-------------------|---------|
| `rrule_timezone` | `UTC` | IANA timezone for the daily run time |
| `rrule_run_at_hour` | `9` | Hour (0–23) in that timezone |
| `rrule_run_at_minute` | `0` | Minute (0–59) |

With shipped defaults, a daily rule runs at **09:00 UTC** (e.g. **12:00** in Nairobi, UTC+3).

To make **new workspaces** default to **07:00 Africa/Nairobi** (stored as **04:00 UTC** in the RRULE `DTSTART`), run once on your database:

```sql
ALTER TABLE workspace
  ALTER COLUMN rrule_timezone SET DEFAULT 'Africa/Nairobi';

ALTER TABLE workspace
  ALTER COLUMN rrule_run_at_hour SET DEFAULT 7;

ALTER TABLE workspace
  ALTER COLUMN rrule_run_at_minute SET DEFAULT 0;
```

This does not change existing workspace rows. To apply the same schedule to workspaces that still use the shipped defaults:

```sql
UPDATE workspace
SET
  rrule_timezone = 'Africa/Nairobi',
  rrule_run_at_hour = 7,
  rrule_run_at_minute = 0
WHERE rrule_timezone = 'UTC'
  AND rrule_run_at_hour = 9
  AND rrule_run_at_minute = 0;
```

Adjust the `WHERE` clause if you only want specific workspaces updated.

Verify a newly created workspace:

```sql
SELECT id, name, rrule_timezone, rrule_run_at_hour, rrule_run_at_minute
FROM workspace
ORDER BY created_at DESC
LIMIT 5;
```

After creating a daily RRule task, confirm the rule uses UTC 04:00 (= Nairobi 07:00):

```sql
SELECT id, title, rrule, next_run_at
FROM rrule_task
ORDER BY created_at DESC
LIMIT 5;
-- rrule should contain DTSTART:...T040000Z for a rule created on that schedule
```

**Notes:**

- Keep PostgreSQL at **UTC** (above); `rrule_timezone` is the workspace’s logical timezone, not the database server timezone.
- Changing defaults or existing workspace rows affects **new or re-saved** RRule tasks only. Already stored `rrule` strings and `next_run_at` values are not updated automatically.

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
