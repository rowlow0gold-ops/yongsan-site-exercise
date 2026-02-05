// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { h } from "vue";

import Home from "@/views/Home.vue";

// ✅ Shared layout for participation/boards
const ParticipationLayout = () => import("@/layouts/ParticipationLayout.vue");

// ✅ Board pages
const Board1 = () => import("@/views/Board1.vue");
const BoardWrite = () => import("@/views/BoardWrite.vue");
const BoardDetail = () => import("@/views/BoardDetail.vue");
const Board2 = () => import("@/views/Board2.vue");

// ✅ NEW: Board Edit page
const BoardEdit = () => import("@/views/BoardEdit.vue");

const NotFound = () => import("@/views/NotFound.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Home stays outside layout (your choice)
    { path: "/", name: "home", component: Home },

    /**
     * ✅ Board area wrapped with shared layout
     * This layout should contain: drawer/left menu, app bar/nav, footer, satisfaction, and <router-view/>.
     */
    {
      path: "/",
      component: ParticipationLayout,
      children: [
        // ✅ IMPORTANT: put "write" BEFORE ":id" to avoid matching "write" as an id
        {
          path: "board/:boardKey/write",
          name: "boardWrite",
          component: BoardWrite,
          meta: {
            title: "칭찬합시다",
            breadcrumbs: [
              { label: "HOME" },
              { label: "참여소통" },
              { label: "구민의견/참여" },
              { label: "칭찬합시다" },
              { label: "글쓰기" },
            ],
          },
        },

        // ✅ NEW: put "edit" BEFORE ":id" so it doesn't get captured as :id
        {
          path: "board/:boardKey/:id/edit",
          name: "boardEdit",
          component: BoardEdit,
          props: true,
          meta: {
            title: "칭찬합시다",
            breadcrumbs: [
              { label: "HOME" },
              { label: "참여소통" },
              { label: "구민의견/참여" },
              { label: "구민의견/참여" },
              { label: "칭찬합시다" },
              { label: "수정" },
            ],
          },
        },

        {
          path: "board/:boardKey/:id",
          name: "boardDetail",
          component: BoardDetail,
          props: true,
          meta: {
            title: "칭찬합시다",
            breadcrumbs: [
              { label: "HOME" },
              { label: "참여소통" },
              { label: "구민의견/참여" },
              { label: "칭찬합시다" },
              { label: "상세" },
            ],
          },
        },

        {
          path: "board1",
          name: "board1",
          component: Board1,
          meta: {
            title: "칭찬합시다",
            breadcrumbs: [
              { label: "HOME" },
              { label: "참여소통" },
              { label: "구민의견/참여" },
              { label: "칭찬합시다" },
            ],
          },
        },

        {
          path: "board2",
          name: "board2",
          component: Board2,
          meta: {
            title: "나도한마디",
            breadcrumbs: [
              { label: "HOME" },
              { label: "참여소통" },
              { label: "구민의견/참여" },
              { label: "나도한마디" },
            ],
          },
        },
      ],
    },

    // Keep your refresh route
    {
      path: "/_refresh",
      name: "_refresh",
      component: { render: () => h("div") },
    },

    // 404
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: NotFound,
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

export default router;
