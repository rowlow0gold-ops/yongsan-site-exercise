<template>
  <header v-if="$vuetify.display.mdAndUp" class="header">
    <div
      ref="hoverZoneRef"
      class="nav-zone"
      @mouseenter="cancelClose()"
      @mouseleave="closeWithDelay()"
    >
      <nav ref="navRef" class="main-nav">
        <button
          v-for="(m, i) in MENU"
          :key="m.label"
          class="nav-btn"
          @mouseenter="open(i)"
          type="button"
        >
          {{ m.label }}
        </button>
      </nav>

      <v-menu
        v-model="menuOpen"
        :target="navRef"
        location="bottom center"
        origin="top center"
        :offset="2"
        :close-on-content-click="false"
        attach="body"
        :transition="false"
      >
        <v-card
          class="mega"
          elevation="8"
          rounded="lg"
          @mouseenter="cancelClose()"
          @mouseleave="closeImmediately"
        >
          <div class="mega-inner" v-if="active">
            <div class="mega-left">
              <div class="mega-title">{{ active.label }}</div>
              <div class="mega-desc">{{ active.desc }}</div>
            </div>

            <div class="mega-cols">
              <div v-for="c in active.children" :key="c.label" class="col">
                <!-- 2nd level: clickable only if it has `to` -->
                <button
                  class="col-head col-head-btn"
                  type="button"
                  :disabled="!c.to"
                  @click="onMenuClick(c)"
                >
                  {{ c.label }}
                </button>

                <!-- 3rd level: clickable items -->
                <div v-if="c.children?.length" class="col-list">
                  <button
                    v-for="x in c.children"
                    :key="x.label"
                    class="col-item col-item-btn"
                    type="button"
                    @click="onMenuClick(x)"
                  >
                    • {{ x.label }}
                  </button>
                </div>
              </div>
            </div>
          </div> </v-card
        >W
      </v-menu>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router"; // ✅ ADD

const router = useRouter(); // ✅ ADD
const route = useRoute(); // ✅ OPTIONAL (for "already on same page" check)

const MENU = [
  {
    label: "종합민원",
    desc: "신속하고 편리한 민원처리",
    children: [
      { label: "종합민원안내" },
      { label: "종합민원신고상담" },
      { label: "부패공익신고" },
      { label: "용산구 옴부즈만" },
    ],
  },
  {
    label: "참여소통",
    desc: "구민 참여와 소통",
    children: [
      {
        label: "구민의견/참여",
        children: [
          { id: "loc", label: "칭찬합시다", to: "/board1" },
          { id: "how", label: "나도한마디", to: "/board2" },
        ],
      },
      { label: "적극행정" },
      { label: "주민참여예산제" },
    ],
  },
  {
    label: "행정정보",
    desc: "구정 운영 및 공개",
    children: [
      { label: "구정운영" },
      { label: "정보공개청구" },
      { label: "계약정보" },
    ],
  },
  {
    label: "용산소개",
    desc: "용산구 안내",
    children: [
      { label: "용산구안내" },
      { label: "구정소식" },
      { label: "관내시설" },
    ],
  },
  {
    label: "분야별 정보",
    desc: "생활 분야 정보",
    children: [
      { label: "문화/관광" },
      { label: "복지" },
      { label: "부동산/토지" },
      { label: "교통" },
    ],
  },
];

const navRef = ref(null);
const menuOpen = ref(false);
const activeIndex = ref(-1);

const active = computed(() =>
  activeIndex.value >= 0 ? MENU[activeIndex.value] : null,
);

let closeTimer = null;

function open(i) {
  activeIndex.value = i;
  menuOpen.value = true;
  cancelClose();
}

async function onMenuClick(item) {
  // ✅ Navigate ONLY if `to` exists
  if (item?.to) {
    // OPTIONAL: avoid navigating to the same path again
    if (route.path !== item.to) {
      await router.push(item.to); // ✅ THIS IS THE MAIN CHANGE
    }

    // close after navigation
    menuOpen.value = false;
    activeIndex.value = -1;
  }
}

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function closeImmediately() {
  cancelClose();
  menuOpen.value = false;
  activeIndex.value = -1;
}

function closeWithDelay() {
  cancelClose();
  closeTimer = setTimeout(() => {
    menuOpen.value = false;
    activeIndex.value = -1;
  }, 240);
}
</script>

<style scoped>
.main-nav {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.nav-btn {
  background: none;
  border: 0;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  margin-inline: clamp(6px, 1.8vw, 28px);
}

/* mega dropdown */
.mega {
  width: min(1100px, 92vw);
}

.mega-inner {
  display: grid;
  grid-template-columns: minmax(140px, 22%) 1fr;
  gap: 24px;
  padding: 22px;
}

.mega-left {
  background: #8f8f8f;
  color: white;
  border-radius: 12px;
  padding: 22px;
  min-height: 320px;
}

.mega-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 12px;
}

.mega-desc {
  opacity: 0.9;
  line-height: 1.5;
}

.mega-cols {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 18px;
  align-content: start;
}

/* column head */
.col-head {
  background: #fdecef;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
}

/* make heads/items clickable but keep existing look */
.col-head-btn,
.col-item-btn {
  border: 0;
  width: 100%;
  cursor: pointer;
}

.col-head-btn:disabled,
.col-item-btn:disabled {
  cursor: default;
  opacity: 1; /* keep design consistent */
}

/* 3rd-level hover effect */
.col-item-btn {
  background: none;
  text-align: left;
  font-size: 16px;
  opacity: 0.9;
  padding: 2px 0;
  transition:
    font-weight 0.15s ease,
    text-decoration 0.15s ease;
}

.col-item-btn:hover:not(:disabled) {
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.col-list {
  display: grid;
  gap: 10px;
  padding: 0 6px;
}

.col-item {
  background: none;
  text-align: left;
  font-size: 16px;
  opacity: 0.9;
}
</style>
