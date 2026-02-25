// src/lib/jwt.js
function base64UrlDecode(str) {
  // base64url -> base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const decoded = atob(padded);

  // handle UTF-8
  try {
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return decoded;
  }
}

export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function getJwtExpMs(token) {
  const payload = parseJwt(token);
  const expSec = payload?.exp;
  if (!expSec || typeof expSec !== "number") return null;
  return expSec * 1000;
}
