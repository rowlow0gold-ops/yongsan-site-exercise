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
      path: "/board1/:id",
      name: "praise-detail",
      component: () => import("@/views/Board1Detail.vue"),
    },
    {
      path: "/board1/write",
      name: "praise-write",
      component: () => import("@/views/Board1Write.vue"),
    },
    {
      path: "/board2",
      name: "praise",
      component: () => import("@/views/Board2.vue"),
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
