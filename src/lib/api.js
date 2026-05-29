import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import pinia from "@/plugins/pinia";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Auth is cookie-based now (HttpOnly access_token + refresh_token cookies set
// by the backend). The browser sends them automatically when withCredentials
// is true; JS can't read the token, which is the whole point.
//
// CSRF: the backend writes a non-HttpOnly XSRF-TOKEN cookie. Axios reads it
// and sends X-XSRF-TOKEN on state-changing requests automatically because the
// xsrf names below match Spring Security's defaults.
const api = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let isRefreshing = false;
let queue = [];

function processQueue(error) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err.config || {};
    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/signup") ||
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/exchange");

    // Hard expiry policy: when the access token has expired (401), do NOT
    // silently refresh. Clear auth state and redirect to login so the user
    // experiences a real 1-minute timeout. The manual ↻ button in the top
    // bar still works to extend the session before it expires.
    if (status === 401 && !isAuthEndpoint) {
      try {
        const auth = useAuthStore(pinia);
        auth.clearAuth?.();
      } catch (_) {}
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/?login=1";
      }
    }
    return Promise.reject(err);
  }
);
export default api;
