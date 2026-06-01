import { afterEach, describe, expect, it, vi } from "vitest";

describe("getAppName", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses VITE_APP_NAME in dev when set", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_APP_NAME", "Acme PM");
    const { getAppName } = await import("./app-branding");
    expect(getAppName()).toBe("Acme PM");
  });

  it("falls back to Kaneo in dev when VITE_APP_NAME is unset", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_APP_NAME", "");
    const { getAppName } = await import("./app-branding");
    expect(getAppName()).toBe("Kaneo");
  });

  it("falls back to Kaneo in production when inject token is still a placeholder", async () => {
    vi.stubEnv("DEV", false);
    const { getAppName } = await import("./app-branding");
    expect(getAppName()).toBe("Kaneo");
  });
});
