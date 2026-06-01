const DEFAULT_APP_NAME = "Kaneo";

export function getAppName(): string {
  const name = import.meta.env.VITE_APP_NAME;
  return name && name !== "KANEO_APP_NAME" ? name : DEFAULT_APP_NAME;
}
