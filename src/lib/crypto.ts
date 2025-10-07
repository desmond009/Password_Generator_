// WebCrypto-based PBKDF2 and AES-GCM helpers (client-side only)

export interface DerivedKeyMaterial {
  aesKey: CryptoKey;
}

export async function importPasswordKey(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

export async function deriveAesKey(password: string, saltB64: string, iterations = 210000): Promise<CryptoKey> {
  const baseKey = await importPasswordKey(password);
  const saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const salt = saltBytes.buffer as ArrayBuffer; // satisfy TS DOM BufferSource typing
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function toBase64(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach(b => (s += String.fromCharCode(b)));
  return btoa(s);
}

export function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function aesGcmEncrypt(aesKey: CryptoKey, plaintext: string): Promise<{ ivB64: string; ctB64: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(plaintext)
  );
  return { ivB64: toBase64(iv), ctB64: toBase64(new Uint8Array(ct)) };
}

export async function aesGcmDecrypt(aesKey: CryptoKey, ivB64: string, ctB64: string): Promise<string> {
  const ivBytes = fromBase64(ivB64);
  const ctBytes = fromBase64(ctB64);
  const iv = ivBytes.buffer as ArrayBuffer;
  const ct = ctBytes.buffer as ArrayBuffer;
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    ct
  );
  return new TextDecoder().decode(pt);
}


