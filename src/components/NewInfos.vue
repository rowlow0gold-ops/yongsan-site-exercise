<template>
  <section class="section">
    <v-container>
      <v-row>
        <!-- LEFT -->
        <v-col cols="12" md="4" class="left-area">
          <h2 class="title">용산소식</h2>

          <div class="tabs">
            <v-btn v-for="t in tabs" :key="t" class="tab" variant="outlined">
              {{ t }}
            </v-btn>
          </div>

          <v-btn class="more-btn" variant="text">
            더 보기 <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>

        <!-- RIGHT -->
        <v-col cols="12" md="8">
          <div :class="['cards', { scroll: isMobile }]">
            <div v-for="(item, i) in items" :key="i" class="card">
              <span class="tag">{{ item.tag }}</span>
              <h3>{{ item.title }}</h3>
              <p class="meta">{{ item.dept }} · {{ item.date }}</p>
              <v-btn icon class="arrow">
                <v-icon>mdi-arrow-top-right</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup>
import { useDisplay } from "vuetify";
import bgItems from "../assets/news-bg.png";
const { smAndDown } = useDisplay();
const isMobile = smAndDown;

const tabs = ["새소식", "보도자료", "고시/공고", "행사/교육"];

const items = [
  {
    tag: "고시/공고",
    title: "이촌동 현대아파트 리모델링 주택건설사업계획 변경승인 고시",
    dept: "주택과",
    date: "2025-12-31",
  },
  {
    tag: "고시/공고",
    title: "2026년도 사회복지법인 (대한기독교여자절제회) 세입세출명세서 공고",
    dept: "가족정책과",
    date: "2025-12-31",
  },
  {
    tag: "고시/공고",
    title: "재산압류통지서 등 공시송달 공고",
    dept: "세무관리과",
    date: "2025-12-31",
  },
];
</script>

<style scoped>
.section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--bg-image);
  background-position:
    left center,
    center;
  background-size: contain, cover;
  background-repeat: no-repeat, no-repeat;
  z-index: 0;
  pointer-events: none;
}

.section > * {
  padding: 20px 0px 20px 0px;
  position: relative;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 28px;
  font-weight: 700;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.tab {
  border-radius: 999px;
}

.more-btn {
  margin-top: 20px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.cards.scroll {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 10px;
}

.card {
  background: white;
  border-radius: 22px;
  padding: 22px;
  min-width: 260px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 5;
}

.tag {
  color: #e0477c;
  font-weight: 700;
  font-size: 14px;
}

.card h3 {
  margin: 12px 0;
  font-size: 17px;
}

.meta {
  color: #777;
  font-size: 13px;
}

.arrow {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #e0477c;
  color: white;
}
</style>
