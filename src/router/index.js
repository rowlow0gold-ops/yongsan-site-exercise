// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { h } from "vue";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

import Home from "@/views/Home.vue";

import { useAlert } from "@/composables/useAlert"; // adjust path if needed

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
          meta: {},
        },

        // ✅ NEW: put "edit" BEFORE ":id" so it doesn't get captured as :id
        {
          path: "board/:boardKey/:id/edit",
          name: "boardEdit",
          component: BoardEdit,
          props: true,
          meta: {},
        },

        {
          path: "board/:boardKey/:id",
          name: "boardDetail",
          component: BoardDetail,
          props: true,
          meta: {},
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

    {
      path: "/signup",
      name: "signup",
      component: () => import("@/views/Signup.vue"),
      meta: {
        title: "회원가입",
        sidebar: "signupSteps", // ✅ switch sidebar
        breadcrumbs: [{ label: "HOME" }, { label: "회원가입" }],
      },
    },

    {
      path: "/mypage",
      component: () => import("@/views/MyPage.vue"),
      meta: { requiresAuth: true },
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const { open } = useAlert();

  const boardKey = String(to.params?.boardKey || "");
  const id = to.params?.id;

  const isBoard2Protected =
    boardKey === "board2" &&
    (to.name === "boardEdit" || to.name === "boardWrite");

  // ✅ board2: edit/write requires login
  if (isBoard2Protected && !auth.isAuthed) {
    open("로그인이 필요합니다.", "error", 2000);
    return { path: "/" };
  }

  // ✅ board2 detail: guest stays on list with alert
  if (boardKey === "board2" && to.name === "boardDetail" && !auth.isAuthed) {
    open("로그인이 필요합니다.", "error");
    return false;
  }

  // ✅ board1 edit requires login + owner check (only for member posts)
  const isBoard1Edit = boardKey === "board1" && to.name === "boardEdit";

  if (isBoard1Edit) {
    try {
      const res = await api.get(`/api/boards/board1/posts/${id}`);
      const post = res.data;

      if (post.authorUserId) {
        // Member post → require login + owner/admin check
        if (!auth.isAuthed) {
          open("로그인이 필요합니다.", "error", 2000);
          return { path: "/" };
        }
        const ownerId = Number(post.authorUserId);
        const myId = Number(auth.user?.id);
        const isAdmin = auth.user?.role === "ADMIN";

        if (ownerId !== myId && !isAdmin) {
          open("작성자만 수정할 수 있습니다.", "error", 2000);
          return { path: "/" };
        }
      }
      // Guest post (no authorUserId) → allow, edit page handles password
    } catch (e) {
      open("접근할 수 없습니다.", "error", 2000);
      return { path: "/" };
    }
  }

  // existing requiresAuth rule
  if (to.meta?.requiresAuth && !auth.isAuthed) {
    open("로그인이 필요합니다.", "error", 2000);
    return { path: "/" };
  }

  return true;
});
export default router;
