const HEX = "0123456789abcdef";

function randomHexFromUuid(length: number): string | null {
  try {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (!uuid) {
      return null;
    }
    return uuid.replace(/-/g, "").slice(0, length);
  } catch {
    return null;
  }
}

function randomHexFromGetRandomValues(length: number): string | null {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    return null;
  }
  const bytes = new Uint8Array(length);
  cryptoObj.getRandomValues(bytes);
  let result = "";
  for (const byte of bytes) {
    result += HEX[byte >> 4] + HEX[byte & 0x0f];
  }
  return result.slice(0, length);
}

function randomHexFromMathRandom(length: number): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += HEX[Math.floor(Math.random() * 16)];
  }
  return result;
}

/** Hex string for non-cryptographic uses (e.g. slug suffix). Works outside Secure Context. */
export function generateRandomHex(length: number): string {
  return (
    randomHexFromUuid(length) ??
    randomHexFromGetRandomValues(length) ??
    randomHexFromMathRandom(length)
  );
}
