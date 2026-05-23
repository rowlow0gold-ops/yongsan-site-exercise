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
    const original = err.config;
    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/signup") ||
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/exchange");

    // Only auto-refresh for GET requests — never silently re-auth on writes
    const isSafeMethod = (original.method || "get").toLowerCase() === "get";

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint &&
      isSafeMethod
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(original));
      }

      isRefreshing = true;

      try {
        const auth = useAuthStore(pinia);
        if (auth.refreshDisabled) {
          // user explicitly logged out -> don't refresh
          window.location.href = "/?login=1";
          return Promise.reject(err);
        }

        // /auth/refresh now sets a fresh access_token cookie server-side;
        // no token returned in the body.
        await refreshClient.post("/auth/refresh");
        processQueue(null);
        return api(original);
      } catch (refreshErr) {
        const auth = useAuthStore(pinia);
        auth.clearAuth();
        processQueue(refreshErr);

        window.location.href = "/?login=1";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;
