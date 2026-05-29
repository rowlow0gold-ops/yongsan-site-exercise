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
    // silently refresh AND do NOT redirect. Keep the user on the current
    // page so any in-progress form data (board write, etc.) isn't wiped.
    // Just clear auth state and show a toast prompting them to log in.
    if (status === 401 && !isAuthEndpoint) {
      try {
        const auth = useAuthStore(pinia);
        if (auth.isAuthed) {
          auth.clearAuth?.();
          try {
            const { useAlert } = await import("@/composables/useAlert");
            useAlert().open("로그인이 필요합니다. 다시 로그인해주세요.", "warning");
          } catch (_) {}
        }
      } catch (_) {}
    }
    return Promise.reject(err);
  }
);
export default api;
