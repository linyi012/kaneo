const DEFAULT_APP_NAME = "Kaneo";

/**
 * Replaced in production JS by `inject-env.ps1` / `env.sh` (`@@` first, then static HTML).
 * Do not use `import.meta.env.VITE_APP_NAME` here — Vite folds `KANEO_APP_NAME` to the default at build time.
 */
const RUNTIME_APP_NAME_TOKEN = "@@KANEO_APP_NAME@@";

function isInjectPlaceholder(value: string): boolean {
  return value.length >= 4 && value.startsWith("@@") && value.endsWith("@@");
}

export function getAppName(): string {
  if (import.meta.env.DEV) {
    const devName = import.meta.env.VITE_APP_NAME?.trim();
    if (devName && devName !== "KANEO_APP_NAME") {
      return devName;
    }
    return DEFAULT_APP_NAME;
  }

  const injected = RUNTIME_APP_NAME_TOKEN.trim();
  if (!injected || isInjectPlaceholder(injected)) {
    return DEFAULT_APP_NAME;
  }
  return injected;
}
