import api from "@/utils/api";

// LOGIN
export function login(email, password) {
  return api.post("/auth/login", { email, password });
}

// LOGOUT (optional)
export function logout() {
  // If you have a backend logout endpoint later:
  return api.post("/auth/logout");
}

// ME (optional)
export function fetchMe() {
  return api.get("/auth/me");
}
