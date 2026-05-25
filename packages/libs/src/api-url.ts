/**
 * Resolves the browser/API origin from `VITE_API_URL`.
 * In dev, falls back to `window.location.origin` so Vite's `/api` proxy is used (port 5173).
 */
export function resolveViteApiOrigin(viteApiUrl?: string): string {
  const configured = viteApiUrl?.trim();
  if (configured) {
    let base = configured.replace(/\/+$/, "");
    if (base.endsWith("/api")) {
      base = base.slice(0, -4);
    }
    if (
      typeof import.meta !== "undefined" &&
      import.meta.env?.DEV &&
      typeof window !== "undefined" &&
      /:1337(\/|$)/.test(base)
    ) {
      return window.location.origin;
    }
    return base;
  }
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.DEV &&
    typeof window !== "undefined"
  ) {
    return window.location.origin;
  }
  return "http://localhost:1337";
}

/**
 * Resolves the Hono client base URL from `VITE_API_URL` (or default).
 * If the value already ends with `/api`, it is returned as-is; otherwise `/api` is appended.
 */
export function resolveApiBaseUrl(viteApiUrl?: string): string {
  const origin = resolveViteApiOrigin(viteApiUrl);
  const base = origin.replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
