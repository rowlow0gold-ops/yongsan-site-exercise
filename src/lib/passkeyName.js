// Auto-generate a passkey nickname from the device's UA so the user doesn't
// have to type one. This is the same pattern Microsoft / Apple / Google use:
//   "MacBook · Touch ID"
//   "iPhone · Face ID"
//   "Android · 지문"
//   "Windows · Hello"
//
// We can't 100% know which biometric the OS will actually use, but the OS
// vendor + device class makes it predictable in 99% of cases. Worst case
// the name looks slightly wrong — never a functional problem.

const DEFAULT = "이 기기";

export function detectPasskeyName() {
  if (typeof navigator === "undefined") return DEFAULT;
  const ua = navigator.userAgent || "";

  // iOS / iPadOS — these always use Face ID or Touch ID; modern devices
  // are overwhelmingly Face ID. Older iPhones (≤ 8) and home-button iPads
  // are Touch ID. We default to Face ID for new devices, Touch ID for old.
  if (/iPhone/i.test(ua)) {
    // iPhone X (2017) and later support Face ID.
    return /OS 1[1-9]_|OS 2[0-9]_/i.test(ua) ? "iPhone · Face ID" : "iPhone · Touch ID";
  }
  if (/iPad/i.test(ua)) {
    return /OS 1[3-9]_|OS 2[0-9]_/i.test(ua) ? "iPad · Face ID" : "iPad · Touch ID";
  }

  // macOS — Macs with Apple Silicon and recent Intel laptops have Touch ID.
  // Browsers can't directly tell, so we say "Touch ID" since most modern
  // Macs do. On a Mac without it, the OS sheet just asks for the password —
  // the label still reads "Touch ID" but functionally it works.
  if (/Mac OS X|Macintosh/i.test(ua)) {
    return "Mac · Touch ID";
  }

  // Android — almost universally fingerprint or face (Pixel/Samsung).
  if (/Android/i.test(ua)) {
    return "Android · 지문";
  }

  // Windows — Hello covers face/fingerprint/PIN.
  if (/Windows NT|Windows/i.test(ua)) {
    return "Windows · Hello";
  }

  // Linux — no native platform authenticator usually; user likely has a
  // hardware security key.
  if (/Linux/i.test(ua)) {
    return "Linux · 보안 키";
  }

  return DEFAULT;
}
