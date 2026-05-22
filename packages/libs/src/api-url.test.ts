import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl, resolveViteApiOrigin } from "./api-url";

describe("resolveViteApiOrigin", () => {
  it("strips a trailing /api segment", () => {
    expect(resolveViteApiOrigin("http://localhost:5173/api")).toBe(
      "http://localhost:5173",
    );
  });
});

describe("resolveApiBaseUrl", () => {
  it("appends /api when the base has no api suffix", () => {
    expect(resolveApiBaseUrl(undefined)).toBe("http://localhost:1337/api");
    expect(resolveApiBaseUrl("http://localhost:1337")).toBe(
      "http://localhost:1337/api",
    );
  });

  it("returns the URL unchanged when it already ends with /api", () => {
    expect(resolveApiBaseUrl("http://localhost:1337/api")).toBe(
      "http://localhost:1337/api",
    );
  });

  it("strips trailing slashes before appending /api", () => {
    expect(resolveApiBaseUrl("http://localhost:1337/")).toBe(
      "http://localhost:1337/api",
    );
    expect(resolveApiBaseUrl("http://localhost:1337/api/")).toBe(
      "http://localhost:1337/api",
    );
  });
});
