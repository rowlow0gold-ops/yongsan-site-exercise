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
          <div class="temp">☀ -5℃ <b class="temp_inner">맑음</b></div>
          <div class="dust">
            미세먼지 <b class="good">(보통)</b> · 초미세먼지
            <b class="good">(보통)</b>
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
        <v-btn icon variant="text" class="allmenu-icon-btn">
          <v-icon icon="mdi-account" />
        </v-btn>

        <v-btn icon variant="text" class="allmenu-icon-btn">
          <v-icon icon="mdi-account-plus" />
        </v-btn>

        <v-btn icon variant="text" class="allmenu-icon-btn">
          <v-icon icon="mdi-earth" />
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
                <v-list-item v-for="c in item.children" :key="c.id">
                  {{ c.label }}
                  <v-list density="compact" v-if="c.children">
                    <v-list-item v-for="g in c.children" :key="g.id">
                      — {{ g.label }}
                    </v-list-item>
                  </v-list>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>

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
            <v-list-item v-for="c in item.children" :key="c.id">
              {{ c.label }}
            </v-list-item>
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
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

defineProps({
  isSticky: { type: Boolean, default: false },
});

const isDesktopMenuOpen = ref(false);

const toggleAllMenu = () => {
  isDesktopMenuOpen.value = !isDesktopMenuOpen.value;
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

const MOBILE_MENU = [
  {
    id: "m1",
    label: "종합민원",
    children: [
      {
        id: "m1-1",
        label: "종합민원안내",
        href: "",
        children: [
          { id: "m1-1-1", label: "민원 절차 안내", href: "" },
          { id: "m1-1-2", label: "민원 처리 기준", href: "" },
          { id: "m1-1-3", label: "민원 서식", href: "" },
        ],
      },
      { id: "m1-2", label: "종합민원신고상담", href: "" },
      { id: "m1-3", label: "부패공익신고", href: "" },
      { id: "m1-4", label: "용산구 옴부즈만", href: "" },
    ],
  },
  {
    id: "m2",
    label: "참여소통",
    children: [
      {
        id: "m2-1",
        label: "구민의견/참여",
        href: "",
        children: [
          { id: "m2-1-1", label: "의견 제출", href: "" },
          { id: "m2-1-2", label: "설문 참여", href: "" },
          { id: "m2-1-3", label: "아이디어 제안", href: "" },
        ],
      },
      { id: "m2-2", label: "적극행정", href: "" },
      { id: "m2-3", label: "주민참여예산제", href: "" },
      { id: "m2-4", label: "마을", href: "" },
    ],
  },
  {
    id: "m3",
    label: "행정정보",
    children: [
      {
        id: "m3-1",
        label: "구정운영",
        href: "",
        children: [
          { id: "m3-1-1", label: "구정 계획", href: "" },
          { id: "m3-1-2", label: "주요 정책", href: "" },
          { id: "m3-1-3", label: "업무 보고", href: "" },
        ],
      },
      { id: "m3-2", label: "정보공개청구", href: "" },
      { id: "m3-3", label: "행정정보공개", href: "" },
      { id: "m3-4", label: "정책실명제", href: "" },
    ],
  },
  {
    id: "m4",
    label: "용산소개",
    children: [
      {
        id: "m4-1",
        label: "용산구안내",
        href: "",
        children: [
          { id: "m4-1-1", label: "조직도", href: "" },
          { id: "m4-1-2", label: "연혁", href: "" },
          { id: "m4-1-3", label: "위치 안내", href: "" },
        ],
      },
      { id: "m4-2", label: "구정소식", href: "" },
      { id: "m4-3", label: "구정홍보", href: "" },
      { id: "m4-4", label: "관내시설", href: "" },
    ],
  },
  {
    id: "m5",
    label: "분야별 정보",
    children: [
      {
        id: "m5-1",
        label: "문화/관광",
        href: "",
        children: [
          { id: "m5-1-1", label: "명소 소개", href: "" },
          { id: "m5-1-2", label: "행사 안내", href: "" },
          { id: "m5-1-3", label: "문화 시설", href: "" },
        ],
      },
      { id: "m5-2", label: "복지", href: "" },
      { id: "m5-3", label: "부동산/토지", href: "" },
      { id: "m5-4", label: "교통", href: "" },
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
</style>
