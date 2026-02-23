import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
  }),
  getters: {
    isAuthed: (s) => !!s.accessToken,
  },
  actions: {
    setAuth({ accessToken, user }) {
      this.accessToken = accessToken;
      this.user = user || null;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(this.user));
    },
    logout() {
      this.accessToken = "";
      this.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
  },
});
