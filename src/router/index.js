// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Board1 from "@/views/Board1.vue";
import Board2 from "@/views/Board2.vue";
import { h } from "vue";
const router = createRouter({
  history: createWebHistory(), // clean URLs: /about (not #/about)
  routes: [
    { path: "/", name: "home", component: Home },
    {
      path: "/board1",
      name: "board1",
      component: Board1,
    },
    {
      path: "/board2",
      name: "board2",
      component: Board2,
    },

    {
      path: "/_refresh",
      name: "_refresh",
      component: { render: () => h("div") }, // ✅ runtime-only safe
    },
    // optional: 404
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // back/forward button
    if (savedPosition) {
      return savedPosition;
    }

    // always scroll to top on navigation
    return { top: 0 };
  },
});

export default router;
