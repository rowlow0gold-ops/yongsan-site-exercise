import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
    user: JSON.parse(localStorage.getItem("authUser") || "null"),
  }),

  getters: {
    isAuthed: (s) => !!s.accessToken,
    authHeader: (s) => (s.accessToken ? `Bearer ${s.accessToken}` : ""),
  },

  actions: {
    setAuth({ accessToken, user }) {
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
    },
  },
});
