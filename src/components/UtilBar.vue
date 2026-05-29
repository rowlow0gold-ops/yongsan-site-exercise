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

      <!-- ✅ JWT time left + manual refresh -->
      <div v-if="auth.isAuthed" class="jwt-left">
        ⏳ {{ jwtLeftText }}
        <v-btn
          variant="text"
          size="x-small"
          icon="mdi-refresh"
          class="refresh-btn ml-1"
          :loading="refreshing"
          :disabled="refreshing"
          aria-label="Refresh access token"
          @click="handleRefresh"
        />
      </div>

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

      </div>
    </v-container>
    <LoginDialog v-model="loginOpen" @go-signup="goSignup" @success="onLoginSuccess" />
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import LoginDialog from "@/components/auth/LoginDialog.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { logoutApi, refreshApi } from "@/api/auth";

const { open } = useAlert();

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

// Sliding session: navigating to a new page silently extends the session
// by calling /auth/refresh. Idle browsing (mousemove / scroll) is NOT
// counted as activity — only meaningful route changes.
let lastSlide = 0;
const SLIDE_THROTTLE_MS = 10 * 1000;
router.afterEach(async (to, from) => {
  if (!auth.isAuthed || refreshing.value) return;
  if (to.fullPath === from.fullPath) return;          // same page, no slide
  const exp = readAccessExpMs();
  if (!exp || Date.now() >= exp) return;              // already expired — let watcher kick
  const ts = Date.now();
  if (ts - lastSlide < SLIDE_THROTTLE_MS) return;     // rate-limit rapid hops
  lastSlide = ts;
  try {
    await refreshApi();
    now.value = Date.now();                            // re-tick countdown
  } catch (_) { /* ignore */ }
});

function formatMs(ms) {
  ms = Math.max(0, ms);
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

// The access token itself is HttpOnly and unreachable from JS, but the
// backend also sets a companion non-HttpOnly cookie `access_expires_at`
// containing only the expiry timestamp (unix millis). That's safe to read
// and lets us render the countdown.
function readAccessExpMs() {
  const m = document.cookie.match(/(?:^|;\s*)access_expires_at=(\d+)/);
  return m ? Number(m[1]) : null;
}

const jwtLeftText = computed(() => {
  const exp = readAccessExpMs();
  if (!exp) return "";
  return formatMs(exp - now.value);
});

// Timer-driven hard logout: when the access token expires (the cookie
// timestamp passes the current time), clear auth state immediately so the
// countdown + refresh icons hide and the right-side button flips back to
// "로그인". We don't wait for the next API request to fire a 401.
const expired = computed(() => {
  const exp = readAccessExpMs();
  return exp != null && now.value >= exp;
});
let kickedAlready = false;
watch(expired, async (isExp) => {
  if (!isExp || kickedAlready || !auth.isAuthed) return;
  kickedAlready = true;
  // Best-effort backend logout: revoke refresh + clear HttpOnly cookies
  // server-side. The token is already expired so the call may 401, that's
  // fine — we just want the backend to wipe the session record.
  try { await logoutApi(); } catch (_) {}
  auth.clearAuth();
  open("세션이 만료되었습니다. 다시 로그인해주세요.", "warning");
});

const refreshing = ref(false);
async function handleRefresh() {
  if (refreshing.value) return;
  refreshing.value = true;
  try {
    await refreshApi();
    now.value = Date.now();
    open("토큰이 갱신되었습니다.", "success");
  } catch (e) {
    console.error(e);
    open("토큰 갱신 실패. 다시 로그인해주세요.", "error");
  } finally {
    refreshing.value = false;
  }
}

async function handleAuthClick() {
  if (!auth.isAuthed) {
    loginOpen.value = true;
    return;
  }

  try {
    await logoutApi();
  } catch (e) {
    console.error(e);
  } finally {
    auth.clearAuth();
    open("로그아웃 되었습니다.", "success");
    router.push("/");
  }
}

function goSignup() {
  loginOpen.value = false;
  router.push({ name: "signup", query: { step: 1 } });
}

const loginOpen = ref(false);

function onLoginSuccess() {
  open("로그인 되었습니다.", "success");
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

.refresh-btn {
  color: #111 !important;
  min-width: 0 !important;
  width: 24px !important;
  height: 24px !important;
}
</style>
