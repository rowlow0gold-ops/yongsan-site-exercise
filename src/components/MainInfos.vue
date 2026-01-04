<script setup>
import { ref, computed } from "vue";

/** Left big card (구청정보) */
const officeItems = [
  { label: "청사안내", icon: "mdi-domain", href: "#" },
  { label: "부서안내", icon: "mdi-sitemap", href: "#" },
  { label: "업무찾기", icon: "mdi-account-search", href: "#" },
  { label: "오시는길", icon: "mdi-map-marker-outline", href: "#" },
];

/** Middle cards */
const promos = [
  {
    title: "간편신청",
    lines: ["교육, 체험, 시설", "예약을", "빠르고 간편하게", "신청하세요!"],
    tone: "hot",
    href: "#",
  },
  {
    title: "동네소식",
    lines: ["주요사업을 동별로", "안내드려요!"],
    tone: "soft",
    href: "#",
  },
  {
    title: "구민참여",
    lines: ["국민제안,", "국민생각함,", "칭찬합시다"],
    tone: "soft",
    href: "#",
  },
];

/** Right card slider (8 per page) */
const services = [
  { label: "대형생활\n폐기물 신청", icon: "mdi-delete-outline", href: "#" },
  { label: "용산생활가이드", icon: "mdi-sprout-outline", href: "#" },
  { label: "민원안내", icon: "mdi-forum-outline", href: "#" },
  { label: "민원상담\n(국민신문고)", icon: "mdi-clock-outline", href: "#" },
  { label: "여권", icon: "mdi-passport", href: "#" },
  { label: "용산 실시간\n스마트맵", icon: "mdi-map-outline", href: "#" },
  { label: "의료기관\n정보", icon: "mdi-hospital-box-outline", href: "#" },
  { label: "민원실대기현황", icon: "mdi-account-group-outline", href: "#" },

  { label: "민원서식", icon: "mdi-file-document-outline", href: "#" },
  { label: "관련사이트", icon: "mdi-link-variant", href: "#" },
  { label: "민방위", icon: "mdi-shield-outline", href: "#" },
  { label: "정보화교육", icon: "mdi-school-outline", href: "#" },
  { label: "부패공익신고", icon: "mdi-alert-circle-outline", href: "#" },
  { label: "주정차단속", icon: "mdi-car-off", href: "#" },
  { label: "생활불편신고", icon: "mdi-bullhorn-outline", href: "#" },
  { label: "일자리정보", icon: "mdi-briefcase-outline", href: "#" },

  { label: "빅데이터 플랫폼", icon: "mdi-database-outline", href: "#" },
];

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
const pages = computed(() => chunk(services, 8));
const page = ref(0);

function nextPage() {
  page.value = (page.value + 1) % pages.value.length;
}
function prevPage() {
  page.value = (page.value - 1 + pages.value.length) % pages.value.length;
}
</script>

<template>
  <section class="major-section">
    <v-container class="py-10">
      <h2 class="major-title">주요정보</h2>

      <v-row class="gx-10 gy-8" align="stretch">
        <!-- LEFT: 구청정보 -->
        <v-col cols="12" md="4">
          <v-card class="card-base card-left" elevation="0">
            <div class="card-h1">구청정보</div>

            <div class="office-grid">
              <a
                v-for="it in officeItems"
                :key="it.label"
                class="office-item"
                :href="it.href"
              >
                <div class="office-ico">
                  <v-icon :icon="it.icon" />
                </div>
                <div class="office-txt">{{ it.label }}</div>
              </a>
            </div>
          </v-card>
        </v-col>

        <!-- MIDDLE: 3 stacked cards -->
        <v-col cols="12" md="3">
          <div class="stack">
            <v-card
              v-for="p in promos"
              :key="p.title"
              class="card-base promo-card"
              :class="p.tone === 'hot' ? 'promo-hot' : 'promo-soft'"
              elevation="0"
              :href="p.href"
              link
            >
              <div class="promo-inner">
                <div class="promo-text">
                  <div class="promo-title">{{ p.title }}</div>
                  <div class="promo-lines">
                    <div v-for="(ln, i) in p.lines" :key="i">
                      <span
                        :class="{
                          strong:
                            ln.includes('빠르고') || ln.includes('간편하게'),
                        }"
                      >
                        {{ ln }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="promo-go">
                  <div class="go-circle">
                    <v-icon icon="mdi-chevron-right" />
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>

        <!-- RIGHT: 자주찾는 서비스 -->
        <v-col cols="12" md="5" class="service-col">
          <v-card class="card-base service-wrap" elevation="0">
            <div class="service-head">
              <div class="service-head-title">자주찾는 서비스</div>
            </div>

            <div class="service-body">
              <v-window v-model="page" class="service-window" :touch="true">
                <v-window-item
                  v-for="(group, gi) in pages"
                  :key="gi"
                  :value="gi"
                >
                  <div class="service-grid">
                    <a
                      v-for="svc in group"
                      :key="svc.label"
                      class="svc"
                      :href="svc.href"
                    >
                      <div class="svc-ico">
                        <v-icon :icon="svc.icon" />
                      </div>
                      <div class="svc-label">
                        <span
                          v-for="(part, pi) in svc.label.split('\n')"
                          :key="pi"
                        >
                          {{ part
                          }}<br
                            v-if="pi !== svc.label.split('\n').length - 1"
                          />
                        </span>
                      </div>
                    </a>
                  </div>
                </v-window-item>
              </v-window>
            </div>
            <!-- side arrows -->
            <button class="nav nav-left" @click="prevPage" aria-label="prev">
              <v-icon icon="mdi-chevron-left" />
            </button>
            <button class="nav nav-right" @click="nextPage" aria-label="next">
              <v-icon icon="mdi-chevron-right" />
            </button>

            <!-- dots -->
            <div class="dots">
              <button
                v-for="(_, i) in pages"
                :key="i"
                class="dot"
                :class="{ active: i === page }"
                @click="page = i"
                :aria-label="`page ${i + 1}`"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
.service-col {
  z-index: 1;
}
/* section background like screenshot */
.major-section {
  background: #fdeff3;
  position: relative;
  overflow: hidden;
}

/* simple “rays” decoration */
.major-section::before {
  content: "";
  position: absolute;
  left: 210px;
  top: 80px;
  width: 380px;
  height: 380px;
  background: conic-gradient(
    from 0deg,
    rgba(223, 128, 165, 0.25) 0 12deg,
    transparent 12deg 24deg
  );
  border-radius: 999px;
  filter: blur(0px);
  transform: rotate(-12deg);
}

.major-section::after {
  content: "";
  position: absolute;
  right: 40px;
  bottom: 60px;
  width: 220px;
  height: 220px;
  background: linear-gradient(
    135deg,
    rgba(223, 128, 165, 0.22),
    transparent 60%
  );
  border-radius: 999px;
  transform: rotate(20deg);
}

.major-title {
  font-size: clamp(36px, 3.2vw, 56px);
  font-weight: 900;
  margin: 0 0 22px;
  letter-spacing: -0.02em;
  color: #2a2a2a;
}

.card-base {
  border-radius: 22px;
  background: #f6f7fb;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

/* LEFT */
.card-left {
  padding: 26px;
  height: 100%;
}
.card-h1 {
  font-size: 30px;
  font-weight: 900;
  color: #2a2a2a;
  margin-bottom: 18px;
  letter-spacing: -0.02em;
}

.office-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 14px;
  margin-top: 10px;
}
.office-item {
  text-decoration: none;
  color: inherit;
  display: grid;
  justify-items: center;
  gap: 10px;
}
.office-ico {
  width: 74px;
  height: 74px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}
.office-ico :deep(.v-icon) {
  font-size: 38px;
  opacity: 0.85;
}
.office-txt {
  font-size: 20px;
  font-weight: 900;
  color: #2e2e2e;
  letter-spacing: -0.02em;
}

/* MIDDLE stacked cards */
.stack {
  display: grid;
  gap: 18px;
  height: 100%;
}
.promo-card {
  padding: 22px 20px;
}
.promo-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.promo-title {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}
.promo-lines {
  font-size: 18px;
  line-height: 1.45;
  font-weight: 700;
}
.promo-lines .strong {
  font-weight: 900;
}
.promo-go {
  flex: 0 0 auto;
}
.go-circle {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #e14979;
  color: #fff;
}

.promo-hot {
  background: #df6a88;
  color: #fff;
}
.promo-hot .promo-title,
.promo-hot .promo-lines {
  color: #fff;
}
.promo-hot .go-circle {
  background: rgba(255, 255, 255, 0.92);
  color: #df6a88;
}

.promo-soft {
  background: #f6f7fb;
  color: #2a2a2a;
}

/* RIGHT: services */
.service-wrap {
  position: relative;
  overflow: visible;
  height: 100%;
  background: #fff;
}
.service-head {
  height: 74px;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #df6a88, #a277e6);
}
.service-head-title {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}
.service-body {
  position: relative;
  padding: 22px 26px 18px;
}

@media (max-width: 600px) {
  .service-body {
    min-height: 650px;
  }
}

@media (min-width: 601px) {
  .service-body {
    min-height: 550px;
  }
}

.service-grid {
  display: grid;
  gap: 18px;
}

@media (min-width: 1501px) {
  .service-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Medium: 3 columns */
@media (max-width: 1500px) {
  .service-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .service-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.svc {
  text-decoration: none;
  color: #2a2a2a;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
  padding: 14px 12px;
  display: grid;
  justify-items: center;
  gap: 10px;
  min-height: 126px;
}
.svc-ico {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.03);
}
.svc-ico :deep(.v-icon) {
  font-size: 34px;
  opacity: 0.85;
}
.svc-label {
  text-align: center;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

/* side nav buttons */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 0;
  background: #fff;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 10;
}

.nav-left {
  left: -20px;
}
.nav-right {
  right: -20px;
}

/* dots */
.dots {
  position: absolute;
  bottom: 14px; /* distance from bottom */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 0; /* no flow margin */
  z-index: 2;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 0;
  background: rgba(0, 0, 0, 0.18);
  cursor: pointer;
}
.dot.active {
  background: #8d3fe1;
}
</style>
