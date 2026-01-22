// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import About from "@/views/About.vue";

const router = createRouter({
  history: createWebHistory(), // clean URLs: /about (not #/about)
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/about", name: "about", component: About },

    // optional: 404
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

export default router;
