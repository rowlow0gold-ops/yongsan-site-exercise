<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

import img1 from "../assets/imageSrc1.jpeg";
import img2 from "../assets/imageSrc2.jpeg";
import img3 from "../assets/imageSrc3.jpeg";
import img4 from "../assets/imageSrc4.jpeg";
import img5 from "../assets/imageSrc5.jpeg";
import yongsanBg from "../assets/YONGSAN.png";

const slides = [img1, img2, img3, img4, img5];

const idx = ref(1); // start at 2nd slide like your screenshot (2/5)
const isPlaying = ref(true);

const total = computed(() => slides.length);
const label = computed(() => `${idx.value + 1} / ${total.value}`);

function next() {
  idx.value = (idx.value + 1) % slides.length;
  resetTimer();
}
function prev() {
  idx.value = (idx.value - 1 + slides.length) % slides.length;
  resetTimer();
}

let timer = null;
function start() {
  stop();
  timer = setInterval(() => next(), 3500);
  isPlaying.value = true;
}
function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  isPlaying.value = false;
}
function togglePlay() {
  if (isPlaying.value) stop();
  else start();
}
function resetTimer() {
  if (isPlaying.value) start();
}

onMounted(() => start());
onBeforeUnmount(() => stop());
</script>

<template>
  <section
    class="alert-section"
    :style="{
      '--bg-img': `url(${yongsanBg})`,
    }"
  >
    <v-container class="py-10">
      <div class="section-head">
        <h2 class="section-title">알림배너</h2>
      </div>

      <div class="stage">
        <!-- LEFT ARROW -->
        <button
          class="nav nav-left"
          type="button"
          @click="prev"
          aria-label="prev"
        >
          <v-icon icon="mdi-chevron-left" />
        </button>

        <!-- SLIDES -->
        <div class="slider">
          <!-- previous (peek) -->
          <div class="peek peek-left" aria-hidden="true">
            <img :src="slides[(idx - 1 + total) % total]" alt="" />
          </div>

          <!-- active -->
          <div class="active">
            <img :src="slides[idx]" alt="banner" />
          </div>

          <!-- next (peek) -->
          <div class="peek peek-right" aria-hidden="true">
            <img :src="slides[(idx + 1) % total]" alt="" />
          </div>
        </div>

        <!-- RIGHT ARROW -->
        <button
          class="nav nav-right"
          type="button"
          @click="next"
          aria-label="next"
        >
          <v-icon icon="mdi-chevron-right" />
        </button>

        <!-- BOTTOM CONTROL PILL -->
        <div class="pill" role="group" aria-label="slider controls">
          <span class="pill-text">{{ label }}</span>

          <button
            class="pill-btn"
            type="button"
            @click="togglePlay"
            aria-label="toggle play"
          >
            <v-icon :icon="isPlaying ? 'mdi-pause' : 'mdi-play'" />
          </button>
        </div>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
/* ===== Background like screenshot ===== */
.alert-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #d56b87 0%, #a57be8 100%);
  padding: 30px 0;
}

/* watermark image + subtle big YONGSAN text */
.alert-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--bg-img);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  opacity: 0.18;
  pointer-events: none;
}

.alert-section::after {
  content: "YONGSAN";
  position: absolute;
  right: 60px;
  top: 36px;
  font-weight: 900;
  font-size: clamp(64px, 6vw, 120px);
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.12);
  pointer-events: none;
  user-select: none;
}

/* ===== Title ===== */
.section-head {
  position: relative;
  z-index: 2;
  margin-bottom: 18px;
}
.section-title {
  color: #fff;
  font-weight: 900;
  font-size: 40px;
  letter-spacing: -0.03em;
  margin: 0;
}

/* ===== Slider stage ===== */
.stage {
  position: relative;
  z-index: 2;
  height: clamp(260px, 34vw, 420px);
  display: grid;
  place-items: center;
}

/* ===== Center slider composition ===== */
.slider {
  position: relative;
  width: min(980px, 92vw);
  height: 100%;
  display: grid;
  place-items: center;
}

/* active card */
.active {
  position: relative;
  z-index: 5;
  width: min(780px, 78vw);
  height: min(280px, 60%);
  border-radius: 18px;
  overflow: hidden;
  /* box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22); */
  /* background: rgba(255, 255, 255, 0.15); */
}
.active img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* peeks (behind) */
.peek {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: min(520px, 60vw);
  height: min(220px, 50%);
  border-radius: 16px;
  overflow: hidden;
  filter: blur(0px);
  opacity: 0.55;
  /* box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16); */
}
.peek img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.peek-left {
  left: -120px;
}
.peek-right {
  right: -120px;
}

/* ===== Side arrows ===== */
.nav {
  position: absolute;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  top: 100%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 5;
  backdrop-filter: blur(6px);
}
.nav-left {
  left: 20px;
}
.nav-right {
  right: 20px;
}

@media (min-width: 1300px) {
  .nav {
    top: 50%;
  }
  .nav-left {
    left: -40px;
  }
  .nav-right {
    right: -40px;
  }
}

/* ===== Bottom pill control ===== */
.pill {
  position: absolute;
  top: 90%;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  z-index: 6;
  backdrop-filter: blur(8px);
}

.pill-text {
  font-weight: 800;
  letter-spacing: 0.02em;
  font-size: 14px;
}
.pill-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}

/* ===== Responsive tweaks ===== */
@media (max-width: 600px) {
  .section-title {
    font-size: 30px;
  }
  .peek-left {
    left: -180px;
  }
  .peek-right {
    right: -180px;
  }
  .nav-left {
    left: 10px;
  }
  .nav-right {
    right: 10px;
  }
}

.active img,
.peek img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
