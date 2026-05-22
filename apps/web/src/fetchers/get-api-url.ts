import { getApiOrigin } from "@/lib/api-origin";

export function getApiUrl(path: string) {
  const trimmedBase = getApiOrigin().replace(/\/+$/, "");
  const apiUrl = trimmedBase.endsWith("/api")
    ? trimmedBase
    : `${trimmedBase}/api`;
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;

  return `${apiUrl}${normalizedPath}`;
}
