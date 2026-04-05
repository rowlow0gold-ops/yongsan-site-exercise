<!-- src/components/Nav.vue -->
<template>
  <!-- MAIN header (single header only) -->
  <v-sheet class="main-header" :class="{ sticky: isSticky }" color="white">
    <v-container class="bar-inner d-flex align-center flex-nowrap py-0">
      <!-- LEFT: logo -->
      <div class="logo-btn" @click="goHome" role="button" tabindex="0">
        <v-img :src="logoUrl" height="52" contain class="logo" />
      </div>
      <v-spacer />

      <!-- Desktop nav -->
      <DesktopMenus />

      <v-spacer />

      <!-- RIGHT: weather/info (desktop only) -->
      <div class="right-info d-none d-lg-flex">
        <div class="weather">
          <div class="temp">{{ icon }} {{ temp ?? '--' }}℃ <b class="temp_inner">{{ desc || '...' }}</b></div>
          <div class="dust">
            미세먼지 <b :class="gradeColor(pm10Grade)">({{ pm10Grade }})</b> · 초미세먼지
            <b :class="gradeColor(pm25Grade)">({{ pm25Grade }})</b>
          </div>
        </div>
      </div>

      <!-- RIGHT: buttons -->
      <v-btn variant="flat" color="#de3a75" rounded="0" class="square-btn">
        <v-icon icon="mdi-magnify" />
        <div class="btn-label d-none d-lg-block">통합검색</div>
      </v-btn>

      <v-btn
        variant="flat"
        :color="isDesktopMenuOpen ? '#4b0c70' : '#711298'"
        rounded="0"
        class="square-btn"
        @click="toggleAllMenu"
      >
        <v-icon icon="mdi-menu" />
        <div class="btn-label d-none d-lg-block">전체메뉴</div>
      </v-btn>
    </v-container>
  </v-sheet>

  <!-- ✅ Mobile All Menu (md and down) -->
  <v-dialog v-model="isDesktopMenuOpen" fullscreen class="d-lg-none">
    <v-card>
      <div class="allmenu-top-icons d-flex align-center">
        <v-btn icon variant="text" class="allmenu-icon-btn" @click="handleMobileAuth">
          <v-icon :icon="auth.isAuthed ? 'mdi-logout' : 'mdi-account'" />
        </v-btn>

        <v-btn icon variant="text" class="allmenu-icon-btn" @click="goSignupOrMypage">
          <v-icon :icon="auth.isAuthed ? 'mdi-account-check' : 'mdi-account-plus'" />
        </v-btn>

        <v-spacer />

        <v-btn icon variant="text" class="allmenu-close" @click="toggleAllMenu">
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <v-card-text>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel v-for="item in MOBILE_MENU" :key="item.id">
            <v-expansion-panel-title>{{ item.label }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <!-- Level 2 as foldable group -->
                <v-list-group
                  v-for="c in item.children"
                  :key="c.id"
                  :value="c.id"
                >
                  <!-- 2nd button (fold/unfold trigger) -->
                  <template #activator="{ props }">
                    <v-list-item v-bind="props" :title="c.label" />
                  </template>

                  <!-- Level 3 list -->
                  <v-list-item
                    v-for="g in c.children || []"
                    :key="g.id"
                    class="grandchild-item"
                    :title="g.label"
                    @click="goMenu(g)"
                  />
                </v-list-group>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- ✅ Mobile LoginDialog -->
  <LoginDialog v-model="mobileLoginOpen" @success="open('로그인 되었습니다.', 'success')" />

  <!-- ✅ Desktop popup (lg and up) -->
  <MenuPopup
    v-if="isDesktopMenuOpen"
    v-model="isDesktopMenuOpen"
    class="d-none d-lg-flex"
  >
    <v-expansion-panels variant="accordion">
      <v-expansion-panel v-for="item in MOBILE_MENU" :key="item.id">
        <v-expansion-panel-title>{{ item.label }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact">
            <!-- Level 2 as foldable group -->
            <v-list-group v-for="c in item.children" :key="c.id" :value="c.id">
              <!-- 2nd button (fold/unfold trigger) -->
              <template #activator="{ props }">
                <v-list-item v-bind="props" :title="c.label" />
              </template>

              <!-- Level 3 list -->
              <v-list-item
                v-for="g in c.children || []"
                :key="g.id"
                class="grandchild-item"
                :title="g.label"
                @click="goMenu(g)"
              />
            </v-list-group>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </MenuPopup>
</template>

<script setup>
import { ref } from "vue";
import logoUrl from "../assets/bi-new.jpg";
import DesktopMenus from "./DesktopMenus.vue";
import MenuPopup from "./MenuPopup.vue";
import LoginDialog from "@/components/auth/LoginDialog.vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { useWeather } from "@/composables/useWeather";
import { logoutApi } from "@/api/auth";

const { open } = useAlert();
const { temp, desc, icon, loading: weatherLoading, pm10Grade, pm25Grade, gradeColor } = useWeather();

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const mobileLoginOpen = ref(false);

defineProps({
  isSticky: { type: Boolean, default: false },
});

const isDesktopMenuOpen = ref(false);

const toggleAllMenu = () => {
  isDesktopMenuOpen.value = !isDesktopMenuOpen.value;
};

const goMenu = (menu) => {
  isDesktopMenuOpen.value = false;
  console.log("=======");
  console.log(menu);
  if (menu.href) {
    router.push(menu.href);
  }
};

const goHome = async () => {
  if (route.path === "/") {
    // force re-render of current route
    await router.replace({ path: "/_refresh" });
    await router.replace({ path: "/" });
  } else {
    router.push("/");
  }
};

async function handleMobileAuth() {
  if (!auth.isAuthed) {
    isDesktopMenuOpen.value = false;
    mobileLoginOpen.value = true;
    return;
  }
  try {
    await logoutApi();
  } catch (e) {
    console.error(e);
  } finally {
    auth.clearAuth();
    isDesktopMenuOpen.value = false;
    open("로그아웃 되었습니다.", "success");
    router.push("/");
  }
}

function goSignupOrMypage() {
  isDesktopMenuOpen.value = false;
  if (auth.isAuthed) {
    router.push("/mypage");
  } else {
    router.push({ name: "signup", query: { step: 1 } });
  }
}

const MOBILE_MENU = [
  {
    id: "m2",
    label: "참여소통",
    children: [
      {
        id: "m2-1",
        label: "구민의견/참여",
        href: "",
        children: [
          { id: "m2-1-5", label: "칭찬합시다", href: "board1" },
          { id: "m2-1-6", label: "나도한마디", href: "board2" },
        ],
      },
    ],
  },
];
</script>

<style scoped>
/* if your CSS is scoped, you MUST use :deep() for Vuetify internals */
:deep(.logo-btn .v-btn__overlay),
:deep(.logo-btn .v-btn__underlay) {
  opacity: 0 !important;
  display: none !important;
}

/* kill any outline/shadow that might appear */
.logo-btn,
.logo-btn:focus,
.logo-btn:focus-visible,
.logo-btn:hover,
.logo-btn:active {
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* shared container width + padding */
.bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
  height: 84px; /* normal height */
  align-items: stretch; /* allow buttons to fill row */
  transition: height 0.2s ease;
}
@media (min-width: 960px) {
  .bar-inner {
    padding: 0 40px;
  }
}

.main-header {
  height: 84px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2000;
  background: #fff;
  overflow: hidden;
}

.main-header.sticky :deep(.bar-inner) {
  height: 66px; /* sticky height */
}

/* ✅ content area is shorter than header to leave room for shadow */
.main-header :deep(.bar-inner) {
  height: calc(100% - var(--shadow-gap));
  align-items: center;
}

/* normal (non-sticky): soft gradient */
.main-header::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 8px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
}

.main-header.sticky::after {
  height: 0;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.6);
  background: none;
}

/* logo */
.logo {
  max-height: 52px;
  width: auto;
  min-width: 104px;
}
.logo-btn {
  padding: 0 !important;
  min-width: unset !important;
  height: auto !important;
  line-height: normal !important;
  display: flex;
  align-items: center;
}

/* right weather */
.right-info {
  margin-right: 18px;
}
.weather {
  text-align: right;
  line-height: 1.2;
}
.temp {
  text-align: center;
  font-weight: 800;
  font-size: 18px;
}
.temp_inner {
  line-height: 2;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}
.dust {
  font-size: 12px;
  color: #444;
}
.good {
  color: #1f9d3a;
  font-weight: 800;
}
.bad {
  color: #e53935;
  font-weight: 800;
}

/* square buttons (fill header box) */
.square-btn {
  width: 66px;
  min-width: 66px !important;
  height: 66px !important;
  min-height: 66px !important;
  padding: 0 !important;
  border-radius: 0 !important;
  align-self: stretch;
}

.square-btn :deep(.v-btn__content) {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-label {
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  margin-top: 2px;
  text-align: center;
}

/* mobile icon row */
.allmenu-top-icons {
  height: 64px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.allmenu-icon-btn :deep(.v-icon) {
  font-size: 26px;
  color: #111;
}

.allmenu-close :deep(.v-icon) {
  font-size: 34px;
  color: #111;
}

/* overlay above sticky header */
:global(.v-overlay) {
  z-index: 3000 !important;
}

.grandchild-item {
  padding-left: 32px !important;
  font-size: 13px;
  opacity: 0.9;
}
</style>
