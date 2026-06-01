# Smooth logo (draft)

New brand assets kept here until you are ready to ship them. The app still uses `/logo-dark.svg` and `/logo-light.svg` in `public/`.

## Files

| File | Use |
|------|-----|
| `logo-dark.svg` | Light UI (dark strokes on light background) |
| `logo-light.svg` | Dark UI (light strokes on dark background) |
| `logo-icon.svg` | Icon-only mark (favicon / compact UI) |

## Preview in dev

Open e.g. `http://localhost:5173/logo-smooth/logo-dark.svg` while the dev server is running.

## Replace production logos

When the artwork is final (same `450×104` viewBox as the current logos, no `transform` on groups):

```bash
cp apps/web/public/logo-smooth/logo-dark.svg apps/web/public/logo-dark.svg
cp apps/web/public/logo-smooth/logo-light.svg apps/web/public/logo-light.svg
```

Copy `logo-icon.svg` into `public/` only if you wire it up (favicon, manifest, etc.).
