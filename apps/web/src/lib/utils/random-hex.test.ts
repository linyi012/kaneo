import { afterEach, describe, expect, it, vi } from "vitest";
import { generateRandomHex } from "./random-hex";

describe("generateRandomHex", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses randomUUID when available", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "abc12345-6789-0000-0000-000000000000",
    );

    expect(generateRandomHex(12)).toBe("abc123456789");
  });

  it("falls back to getRandomValues when randomUUID throws", () => {
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      throw new TypeError("crypto.randomUUID is not a function");
    });
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      for (let i = 0; i < array.length; i += 1) {
        array[i] = 0xab;
      }
      return array;
    });

    expect(generateRandomHex(12)).toBe("abababababab");
  });

  it("falls back to getRandomValues when randomUUID is missing", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      undefined as unknown as `${string}-${string}-${string}-${string}-${string}`,
    );
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      for (let i = 0; i < array.length; i += 1) {
        array[i] = 0xab;
      }
      return array;
    });

    expect(generateRandomHex(12)).toBe("abababababab");
  });

  it("falls back to Math.random when Web Crypto is unavailable", () => {
    const mathSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
    });

    expect(generateRandomHex(12)).toBe("000000000000");

    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
    mathSpy.mockRestore();
  });

  it("returns only lowercase hex characters", () => {
    expect(generateRandomHex(12)).toMatch(/^[a-f0-9]{12}$/);
  });
});
