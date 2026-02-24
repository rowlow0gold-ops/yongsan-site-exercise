// src/api/auth.js
import api from "@/lib/api";

export function loginApi(email, password) {
  return api.post("/auth/login", {
    email,
    password,
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
