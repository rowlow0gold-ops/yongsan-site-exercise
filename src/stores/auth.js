import { defineStore } from "pinia";

// With cookie-based auth, the access token is HttpOnly and unreachable from JS.
// We only track the user identity here (so the UI can render "Welcome, name").
// `isAuthed` is derived from whether we have a user object, which is set after
// a successful /auth/me call.
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("authUser") || "null"),
    // Flag set when the user explicitly logs out, used by api.js to suppress
    // the auto-refresh interceptor until they log back in.
    refreshDisabled: localStorage.getItem("refreshDisabled") === "true",
  }),

  getters: {
    isAuthed: (s) => !!s.user,
  },

  actions: {
    setAuth({ user }) {
      this.refreshDisabled = false;
      localStorage.removeItem("refreshDisabled");
      this.user = user || null;
      if (this.user) {
        localStorage.setItem("authUser", JSON.stringify(this.user));
      } else {
        localStorage.removeItem("authUser");
      }
    },

    setUser(user) {
      this.user = user || null;
      if (this.user) {
        localStorage.setItem("authUser", JSON.stringify(this.user));
      } else {
        localStorage.removeItem("authUser");
      }
    },

    clearAuth() {
      this.user = null;
      this.refreshDisabled = true;
      localStorage.removeItem("authUser");
      localStorage.setItem("refreshDisabled", "true");
    },
  },
});
