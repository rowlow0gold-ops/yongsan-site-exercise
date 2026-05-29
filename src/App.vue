<template>
  <v-app class="app-root">
    <v-main class="app-main">
      <TopBanner />
      <UtilBar />

      <!-- sentinel stays in layout (no v-show / no hiding) -->
      <div ref="stickySentinel" class="sticky-sentinel"></div>

      <Nav :is-sticky="isSticky" />

      <router-view />
    </v-main>
    <Footer />

    <v-fab
      class="go-top-fab"
      icon="mdi-chevron-up"
      color="black"
      size="large"
      @click="scrollToTop"
    />
    <v-snackbar v-if="show" v-model="show" :color="color" timeout="-1">
      {{ message }}
    </v-snackbar>

    <!-- Globally mounted: watches auth state and offers passkey enrollment
         after any successful login on devices that don't have a passkey yet. -->
    <PasskeyEnrollPrompt />
  </v-app>
</template>

<script setup>
import TopBanner from "./components/TopBanner.vue";
import UtilBar from "./components/UtilBar.vue";
import Nav from "./components/Nav.vue";
import Footer from "./components/Footer.vue";
import PasskeyEnrollPrompt from "./components/auth/PasskeyEnrollPrompt.vue";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useAlert } from "@/composables/useAlert";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { meApi, exchangeApi } from "@/api/auth";

const { show, message, color, close, open } = useAlert();
const router = useRouter(); // ← move here
const route = useRoute(); // ← move here

const isSticky = ref(false);
const stickySentinel = ref(null);

let ticking = false;

// ✅ hysteresis (buffer) prevents flicker
const ON_AT = 0; // become sticky when sentinel reaches top
const OFF_AT = 24; // stop being sticky only when sentinel goes back down (buffer)

function updateSticky() {
  const el = stickySentinel.value;
  if (!el) return;

  const top = el.getBoundingClientRect().top;

  // turn ON
  if (!isSticky.value && top <= ON_AT) {
    isSticky.value = true;
  }
  // turn OFF (only when clearly back)
  else if (isSticky.value && top > OFF_AT) {
    isSticky.value = false;
  }
}

function onScroll() {
  if (ticking) return;
  ticking = true;

  requestAnimationFrame(() => {
    updateSticky();
    ticking = false;
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(async () => {
  close();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Cookie-auth bootstrap: if the user still has a valid access_token cookie
  // from a previous session, rehydrate the in-memory user record. A 401 here
  // is fine — it just means we're not logged in.
  const authStore = useAuthStore();
  if (!authStore.refreshDisabled) {
    try {
      const res = await meApi();
      authStore.setAuth({ user: res.data });
    } catch (_) {
      // not logged in; the auto-refresh interceptor will handle any in-flight
      // requests that need a session
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
});

// After OAuth login the backend redirects with ?code=<one-time code>.
// We exchange it via POST /auth/exchange; the backend then sets the
// HttpOnly access_token cookie. JS never sees the token itself.
watch(
  () => route.query.code,
  async (code) => {
    if (!code) return;
    const authStore = useAuthStore();
    // Strip the code from the URL immediately so it can't be re-used or
    // accidentally bookmarked.
    router.replace({ query: {} });
    try {
      await exchangeApi(code);          // sets access_token cookie server-side
      const res = await meApi();        // fetches the user record using cookie
      authStore.setAuth({ user: res.data });
      open("로그인 되었습니다.", "success");
    } catch (e) {
      console.error("OAuth code exchange failed", e);
      open("로그인에 실패했습니다.", "error");
    }
  },
  { immediate: true },
);
</script>

<style>
.sticky-sentinel {
  height: 1px;
}

.go-top-fab {
  position: fixed !important;
  right: 20px !important;
  bottom: 20px !important;
  z-index: 9999 !important;
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
</style>
