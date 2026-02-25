<template>
  <v-sheet class="util-bar d-none d-md-flex" height="44">
    <v-container class="bar-inner d-flex align-center flex-nowrap py-0">
      <div class="util-links">
        <a href="">용산구청</a><span class="sep">|</span> <a href="">보건소</a
        ><span class="sep">|</span> <a href="">열린구청장실</a
        ><span class="sep">|</span> <a href="">부서·동</a
        ><span class="sep">|</span> <a href="">교육포털</a
        ><span class="sep">|</span> <a href="">자치회관</a
        ><span class="sep">|</span>
        <a href="">구의회</a>
      </div>

      <v-spacer />

      <!-- ✅ JWT time left -->
      <div v-if="auth.isAuthed" class="jwt-left">⏳ {{ jwtLeftText }}</div>

      <div class="util-actions">
        <!-- ✅ open popup -->
        <v-btn
          variant="text"
          class="util-btn"
          :prepend-icon="auth.isAuthed ? 'mdi-logout' : 'mdi-account'"
          @click="handleAuthClick"
        >
          {{ auth.isAuthed ? "로그아웃" : "로그인" }}
        </v-btn>

        <v-btn
          variant="text"
          class="util-btn"
          prepend-icon="mdi-account-plus"
          :to="signupOrMypageRoute"
        >
          {{ auth.isAuthed ? "마이페이지" : "회원가입" }}
        </v-btn>

        <v-btn variant="text" class="util-btn" prepend-icon="mdi-earth">
          Language
        </v-btn>
      </div>
    </v-container>
    <LoginDialog v-model="loginOpen" @go-signup="goSignup" />
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import LoginDialog from "@/components/auth/LoginDialog.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const signupOrMypageRoute = computed(() => {
  if (auth.isAuthed) {
    return { path: "/mypage" };
  } else {
    return { name: "signup", query: { step: 1 } };
  }
});

// tick every second so computed updates
const now = ref(Date.now());
let timerId;

onMounted(() => {
  timerId = setInterval(() => (now.value = Date.now()), 1000);
});
onUnmounted(() => clearInterval(timerId));

function getExpMsFromJwt(token) {
  if (!token) return null;
  // just in case someone stored "Bearer xxx"
  token = token.replace(/^Bearer\s+/i, "");

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function formatMs(ms) {
  ms = Math.max(0, ms);
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

const jwtLeftText = computed(() => {
  const expMs = getExpMsFromJwt(auth.accessToken);
  if (!auth.isAuthed) return "";
  if (!expMs) return "JWT: (no exp)";
  const left = expMs - now.value;
  if (left <= 0) return "JWT: expired";
  return `JWT: ${formatMs(left)}`;
});

function handleAuthClick() {
  if (auth.isAuthed) {
    auth.clearAuth(); // logout
    router.push("/"); // optional redirect
  } else {
    loginOpen.value = true; // open login dialog
  }
}

function goSignup() {
  loginOpen.value = false;
  router.push({ name: "signup", query: { step: 1 } });
}

const loginOpen = ref(false);

function onLoginSuccess() {
  // frontend-only for now: just close and optionally show a message
  // dialog already closes itself in the component, so this can be empty.
  // Later you can route to mypage or change header state.
}
</script>

<style scoped>
.bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
}
@media (min-width: 960px) {
  .bar-inner {
    padding: 0 40px;
  }
}

.util-bar {
  color: #fff;
  background-color: #2f5597 !important;
}

.util-links a,
.util-actions .util-btn {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.util-links {
  display: flex;
  gap: 10px;
  align-items: center;
  white-space: nowrap;
}

.sep {
  opacity: 0.6;
}

.util-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0px 14px;
  border-radius: 999px;
  background: #fff;
}

.util-btn {
  text-transform: none;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.2px;
  color: #111 !important;
  min-width: auto !important;
  padding: 0 8px !important;
}

.jwt-left {
  font-size: 14px;
  font-weight: 800;
  margin-right: 10px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  color: #111;
}
</style>
