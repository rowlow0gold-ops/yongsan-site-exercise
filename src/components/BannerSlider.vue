<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

const modules = import.meta.glob("../assets/banner_new*.jpg", { eager: true });
const realSlides = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default);

const total = computed(() => realSlides.length);
const trackSlides = computed(() =>
  total.value ? [...realSlides, realSlides[0]] : []
);

const index = ref(0);
const trackIndex = ref(0);
const animate = ref(true);

const isAnimating = ref(false);
const isPlaying = ref(true);
const intervalMs = 5000;
let timerId = null;

const pendingTeleport = ref(false);
const trackEl = ref(null);

function start() {
  stop();
  isPlaying.value = true;
  timerId = setInterval(() => next(true), intervalMs);
}
function stop() {
  isPlaying.value = false;
  if (timerId) clearInterval(timerId);
  timerId = null;
}
function resetTimer() {
  if (isPlaying.value) start();
}
function togglePlay() {
  isPlaying.value ? stop() : start();
}

function next(fromTimer = false) {
  if (!total.value) return;
  if (isAnimating.value) return; // block until transition ends

  isAnimating.value = true;
  animate.value = true;

  trackIndex.value += 1;

  // last(real) -> clone(first)
  if (trackIndex.value === total.value) {
    pendingTeleport.value = true;

    // ✅ keep dots / UI on "first" while showing the clone
    index.value = 0;
  } else {
    index.value = trackIndex.value;
  }

  if (!fromTimer) resetTimer();
}

async function prev() {
  if (!total.value) return;
  if (isAnimating.value) return; // ✅ block until transition ends

  isAnimating.value = true;

  if (trackIndex.value === 0) {
    // jump to clone-last without animation, then animate one step left
    animate.value = false;
    await nextTick();

    trackIndex.value = total.value; // go to the clone position at the end
    index.value = total.value - 1; // show last dot
    await nextTick();

    trackEl.value?.getBoundingClientRect(); // commit transition:none

    requestAnimationFrame(() => {
      animate.value = true;
      trackIndex.value -= 1; // animate to last(real)
      // index already correct
    });
  } else {
    animate.value = true;
    trackIndex.value -= 1;
    index.value = trackIndex.value;
  }

  resetTimer();
}

async function onTrackTransitionEnd(e) {
  // ensure we only respond to the track's transform transition
  if (e.propertyName && e.propertyName !== "transform") return;

  // ✅ always unlock after any slide transition finishes
  isAnimating.value = false;

  // handle last(real) -> clone(first) teleport
  if (!pendingTeleport.value) return;

  pendingTeleport.value = false;

  animate.value = false;
  await nextTick();

  trackIndex.value = 0;
  index.value = 0;
  await nextTick();

  trackEl.value?.getBoundingClientRect();

  // optional: restore animation after the no-anim teleport
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animate.value = true;
    });
  });
}

// ✅ preload + decode (prevents white frame even when cached)
async function preloadImages(urls) {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = async () => {
            // decode helps avoid "loaded but not rendered yet" flashes
            if (img.decode) {
              try {
                await img.decode();
              } catch {}
            }
            resolve(true);
          };
          img.onerror = () => resolve(false);
        })
    )
  );
}

onMounted(async () => {
  // ✅ FIX: you were preloading `slides` (undefined). Preload real/track slides.
  await preloadImages(
    trackSlides.value.length ? trackSlides.value : realSlides
  );

  if (total.value) start();
});
onBeforeUnmount(stop);
</script>

<template>
  <v-card class="banner-card" elevation="0">
    <div class="slider-window">
      <div
        ref="trackEl"
        class="slider-track"
        :class="{ 'no-anim': !animate }"
        :style="{ transform: `translateX(-${trackIndex * 100}%)` }"
        @transitionend.self="onTrackTransitionEnd"
      >
        <div
          v-for="(src, i) in trackSlides"
          :key="src + '-' + i"
          class="slider-slide"
        >
          <img :src="src" loading="eager" decoding="async" draggable="false" />
        </div>
      </div>
    </div>

    <v-btn
      class="banner-btn banner-prev"
      icon
      color="white"
      variant="tonal"
      @click="prev"
    >
      <v-icon icon="mdi-chevron-left" />
    </v-btn>

    <v-btn
      class="banner-btn banner-next"
      icon
      color="white"
      variant="tonal"
      @click="next(false)"
    >
      <v-icon icon="mdi-chevron-right" />
    </v-btn>

    <v-btn
      class="banner-btn banner-stop"
      icon
      color="white"
      variant="tonal"
      @click="togglePlay"
    >
      <v-icon :icon="isPlaying ? 'mdi-pause' : 'mdi-play'" />
    </v-btn>
  </v-card>
</template>

<style scoped>
.banner-card {
  position: relative;
  overflow: hidden;
  border-radius: 0 16px 0 16px;
}

/* ✅ give a non-white base so even 1-frame gaps aren't white */
.slider-window {
  width: 100%;
  height: 100%;
  aspect-ratio: 1040 / 450;
  max-height: 450px;
  background: #f6f6f6;
}

.slider-track {
  display: flex;
  height: 100%;
  transition: transform 450ms ease;
  will-change: transform;
}

.slider-track.no-anim {
  transition: none !important;
}

.slider-slide {
  flex: 0 0 100%;
  height: 100%;
}

.slider-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: transparent;
}

.banner-btn {
  position: absolute;
  z-index: 2;
}

.banner-prev {
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.banner-next {
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.banner-stop {
  right: 12px;
  bottom: 12px;
}
</style>
