// Small helpers for converting between ArrayBuffer / Uint8Array and base64url
// strings — the format WebAuthn JSON uses on the wire.

export function bufToB64Url(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64UrlToBuf(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const norm = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}
