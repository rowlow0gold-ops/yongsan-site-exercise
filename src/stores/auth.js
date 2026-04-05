import { defineStore } from "pinia";
import { getJwtExpMs } from "@/lib/jwt";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
    user: JSON.parse(localStorage.getItem("authUser") || "null"),
    refreshDisabled: localStorage.getItem("refreshDisabled") === "true",

    expiresAtMs: (s) => getJwtExpMs(s.accessToken), // timestamp (ms) or null

    timeLeftMs: (s) => {
      const exp = getJwtExpMs(s.accessToken);
      if (!exp) return 0;
      return Math.max(0, exp - Date.now());
    },
  }),

  getters: {
    isAuthed: (s) => {
      if (!s.accessToken) return false;
      const exp = getJwtExpMs(s.accessToken);
      // If we can't read expiry, trust that the token exists
      if (!exp) return true;
      // 5-second buffer so we don't send a token that expires mid-request
      return exp > Date.now() + 5000;
    },
    authHeader: (s) => (s.accessToken ? `Bearer ${s.accessToken}` : ""),
  },

  actions: {
    setAuth({ accessToken, user }) {
      this.refreshDisabled = false;
      localStorage.removeItem("refreshDisabled");
      this.accessToken = accessToken;
      this.user = user || null;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("authUser", JSON.stringify(this.user));
    },

    setAccessToken(accessToken) {
      this.accessToken = accessToken || "";
      if (this.accessToken)
        localStorage.setItem("accessToken", this.accessToken);
      else localStorage.removeItem("accessToken");
    },

    clearAuth() {
      this.accessToken = "";
      this.user = null;
      this.refreshDisabled = true;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      localStorage.setItem("refreshDisabled", "true");
    },
  },
});
