// AES-GCM encryption that runs entirely in the browser via Web Crypto.
// The key is generated client-side and only ever travels inside a URL
// fragment (`#k=...`), which browsers never send to the server, so the
// server only ever stores/sees ciphertext.

const ALGO = 'AES-GCM';
const IV_BYTES = 12;

// crypto.subtle wants a plain ArrayBuffer-backed view; Uint8Array's `.buffer`
// is typed as the wider ArrayBufferLike, so copy into a fresh ArrayBuffer.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - (s.length % 4)) % 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function generateKey(): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  return toBase64Url(raw);
}

async function importKey(keyB64: string): Promise<CryptoKey> {
  const raw = fromBase64Url(keyB64);
  return crypto.subtle.importKey('raw', toArrayBuffer(raw), ALGO, false, ['encrypt', 'decrypt']);
}

export async function encryptField(keyB64: string, plaintext: string): Promise<string> {
  const key = await importKey(keyB64);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: ALGO, iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(new TextEncoder().encode(plaintext))
  );
  const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.length);
  return toBase64Url(combined);
}

export async function decryptField(keyB64: string, blob: string): Promise<string> {
  const key = await importKey(keyB64);
  const combined = fromBase64Url(blob);
  const iv = combined.slice(0, IV_BYTES);
  const cipher = combined.slice(IV_BYTES);
  const plainBuf = await crypto.subtle.decrypt(
    { name: ALGO, iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(cipher)
  );
  return new TextDecoder().decode(plainBuf);
}

export async function encryptOptional(keyB64: string, v: string | undefined | null): Promise<string | undefined> {
  if (!v) return undefined;
  return encryptField(keyB64, v);
}

export async function decryptOptional(keyB64: string, v: string | undefined | null): Promise<string | undefined> {
  if (!v) return undefined;
  return decryptField(keyB64, v);
}

export function keyFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('k');
}
