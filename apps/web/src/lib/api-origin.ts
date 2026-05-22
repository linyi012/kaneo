import { resolveViteApiOrigin } from "@kaneo/libs";

/** API origin for auth and fetchers (dev uses Vite proxy on the page origin). */
export function getApiOrigin(): string {
	return resolveViteApiOrigin(import.meta.env.VITE_API_URL);
}
