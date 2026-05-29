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

export function signupApi(name, email, password, cfTurnstileToken) {
  return api.post("/auth/signup", { name, email, password, cfTurnstileToken });
}

// Exchange the one-time code returned by the OAuth redirect for an access token.
export function exchangeApi(code) {
  return api.post("/auth/exchange", { code });
}
