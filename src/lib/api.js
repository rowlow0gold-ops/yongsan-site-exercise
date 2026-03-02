import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import pinia from "@/plugins/pinia";
console.log("[api.js loaded] pinia=", pinia);
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore(pinia); // or useAuthStore() if you use active pinia
  console.log("[api req] auth=", auth, "token=", auth?.accessToken);
  const token = auth?.accessToken; // ✅ prevents crash even if undefined

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err.config;

    if ((status === 401 || status === 403) && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers = original.headers || {}; // ✅ avoid undefined
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        const auth = useAuthStore(pinia);
        if (auth.refreshDisabled) {
          // user explicitly logged out -> don't refresh
          window.location.href = "/?login=1";
          return Promise.reject(err);
        }

        const { data } = await refreshClient.post("/auth/refresh");
        const newToken = data.accessToken;

        auth.setAccessToken(newToken);
        processQueue(null, newToken);

        original.headers = original.headers || {}; // ✅ avoid undefined
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        const auth = useAuthStore(pinia); // ✅ IMPORTANT
        auth.clearAuth();
        processQueue(refreshErr, null);

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
