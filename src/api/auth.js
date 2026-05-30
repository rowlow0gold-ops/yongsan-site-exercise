// src/api/auth.js
import api from "@/lib/api";

export function loginApi(email, password, cfTurnstileToken) {
  return api.post("/auth/login", {
    email,
    password,
    cfTurnstileToken,
  });
}

export function refreshApi() {
  return api.post("/auth/refresh");
}

export function logoutApi() {
  return api.post("/auth/logout");
}

export function meApi() {
  return api.get("/auth/me");
}

export function signupApi(name, email, password) {
  return api.post("/auth/signup", { name, email, password });
}

// Exchange the one-time code returned by the OAuth redirect for an access token.
export function exchangeApi(code) {
  return api.post("/auth/exchange", { code });
}

// "Does this email belong to a registered account?" — used by LoginDialog
// before kicking off WebAuthn, so the user gets 'no such account' instead
// of a silent identity swap. Returns { exists: bool }.
export function emailExistsApi(email) {
  return api.post("/auth/email-exists", { email });
}

// 탈퇴 — permanent account deletion. Server anonymizes the user's posts
// (kept for community value) and removes everything else tied to the
// account (passkeys, refresh tokens, satisfaction rows, user row).
// Server clears both auth cookies on response.
export function deleteAccountApi() {
  return api.delete("/auth/me");
}

// Email verification (6-digit code, authenticated user)
export function verifyEmailApi(code) {
  return api.post("/auth/verify", { code });
}
export function resendVerificationApi() {
  return api.post("/auth/verify/resend");
}

// Password reset
export function requestPasswordResetApi(email, cfTurnstileToken) {
  return api.post("/auth/password-reset/request", { email, cfTurnstileToken });
}
export function confirmPasswordResetApi(token, newPassword) {
  return api.post("/auth/password-reset/confirm", { token, newPassword });
}
export function validatePasswordResetTokenApi(token) {
  return api.post("/auth/password-reset/validate", { token });
}
