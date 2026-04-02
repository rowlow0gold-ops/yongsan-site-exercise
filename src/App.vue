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
  </v-app>
</template>

<script setup>
import TopBanner from "./components/TopBanner.vue";
import UtilBar from "./components/UtilBar.vue";
import Nav from "./components/Nav.vue";
import Footer from "./components/Footer.vue";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useAlert } from "@/composables/useAlert";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { meApi } from "@/api/auth";

const { show, message, color, close } = useAlert();
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
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
});

// Add this after const route = useRoute();
watch(
  () => route.query.token,
  async (token) => {
    if (token) {
      const authStore = useAuthStore();
      authStore.setAccessToken(token);
      try {
        const res = await meApi();
        authStore.setAuth({ accessToken: token, user: res.data });
      } catch (e) {
        console.error("Failed to get user info", e);
      }
      router.replace({ query: {} });
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
