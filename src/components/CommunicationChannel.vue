<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";

// assets (change paths if your folder is different)
import ytBg from "../assets/bimg-01a.png";
import ytText from "../assets/bimg-012a_dea.png";
import newsBg from "../assets/bimg-02.png";
import talkBg from "../assets/bimg-03.png";
import snsBg from "../assets/bimg-04.png";

const { mdAndUp } = useDisplay();
const isDesktop = computed(() => mdAndUp.value);

// links (edit)
const links = {
  youtube: "#",
  newsletter: "#",
  alarmtalk: "#",
  sns: "#",
};

function go(href) {
  if (!href) return;
  window.location.href = href;
}
</script>

<template>
  <section class="comm-section">
    <v-container class="py-10">
      <!-- DESKTOP -->
      <v-row v-if="isDesktop" class="gy-8" align="stretch">
        <!-- left title -->
        <v-col cols="12" md="3" class="title-col">
          <h2 class="title">소통채널</h2>
        </v-col>

        <!-- right grid -->
        <v-col cols="12" md="9">
          <div class="grid">
            <!-- top row -->
            <a
              class="banner banner-yt span-2"
              :href="links.youtube"
              :style="{ backgroundImage: `url(${ytBg})` }"
            >
              <span class="sr-only">유튜브</span>
              <div class="yt-overlay">
                <img
                  class="yt-text"
                  :src="ytText"
                  alt="새로운 변화 행복한 용산 유튜브"
                />
              </div>
              <button class="circle-btn" type="button" aria-label="go">
                <v-icon icon="mdi-chevron-right" />
              </button>
            </a>

            <a
              class="banner banner-news"
              :href="links.newsletter"
              :style="{ backgroundImage: `url(${newsBg})` }"
            >
              <div class="banner-title">용산소식지</div>
              <button class="circle-btn" type="button" aria-label="go">
                <v-icon icon="mdi-chevron-right" />
              </button>
            </a>

            <!-- bottom row -->
            <a
              class="banner banner-talk"
              href=""
              :style="{ backgroundImage: `url(${talkBg})` }"
            >
              <div class="banner-title">용산구 알림톡 신청하기</div>
              <button
                class="circle-btn circle-btn-pos"
                type="button"
                aria-label="go"
              >
                <v-icon icon="mdi-chevron-right" />
              </button>
            </a>

            <a
              class="banner banner-sns span-2"
              href=""
              :style="{ backgroundImage: `url(${snsBg})` }"
            >
              <div class="sns-block">
                <div class="sns-title">SNS</div>
                <div class="sns-sub">
                  용산구 최신 소식을 가장 빠르게 만나보세요.
                </div>

                <div class="sns-icons">
                  <v-icon icon="mdi-instagram" />
                  <v-icon icon="mdi-facebook" />
                  <v-icon icon="mdi-youtube" />
                  <v-icon icon="mdi-chat" />
                  <v-icon icon="mdi-twitter" />
                </div>
              </div>

              <button class="circle-btn right" type="button" aria-label="go">
                <v-icon icon="mdi-chevron-right" />
              </button>
            </a>
          </div>
        </v-col>
      </v-row>

      <!-- MOBILE -->
      <div v-else class="mobile">
        <h2 class="title mobile-title">소통채널</h2>

        <!-- YouTube (uses 2 images) -->
        <a
          class="banner banner-yt mobile-banner"
          href=""
          :style="{ backgroundImage: `url(${ytBg})` }"
        >
          <span class="sr-only">유튜브</span>

          <div class="yt-overlay mobile-yt">
            <img
              class="yt-text"
              :src="ytText"
              alt="새로운 변화 행복한 용산 유튜브"
            />
          </div>

          <button class="circle-btn" type="button" aria-label="go">
            <v-icon icon="mdi-chevron-right" />
          </button>
        </a>

        <!-- 용산소식지 -->
        <a
          class="banner banner-news mobile-banner"
          href=""
          :style="{ backgroundImage: `url(${newsBg})` }"
        >
          <div class="banner-title">용산소식지</div>
          <button class="circle-btn" type="button" aria-label="go">
            <v-icon icon="mdi-chevron-right" />
          </button>
        </a>

        <!-- 알림톡 -->
        <a
          class="banner banner-talk mobile-banner"
          href=""
          :style="{ backgroundImage: `url(${talkBg})` }"
        >
          <div class="banner-title">용산구 알림톡 신청하기</div>
          <button class="circle-btn" type="button" aria-label="go">
            <v-icon icon="mdi-chevron-right" />
          </button>
        </a>

        <!-- SNS -->
        <a
          class="banner banner-sns mobile-banner"
          href=""
          :style="{ backgroundImage: `url(${snsBg})` }"
        >
          <div class="sns-block">
            <div class="sns-title">SNS</div>
            <div class="sns-sub">
              용산구 최신 소식을 가장 빠르게 만나보세요.
            </div>

            <div class="sns-icons">
              <v-icon icon="mdi-instagram" />
              <v-icon icon="mdi-facebook" />
              <v-icon icon="mdi-youtube" />
              <v-icon icon="mdi-chat" />
              <v-icon icon="mdi-twitter" />
            </div>
          </div>

          <button class="circle-btn right" type="button" aria-label="go">
            <v-icon icon="mdi-chevron-right" />
          </button>
        </a>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
.comm-section {
  background: #fff;
}

/* title */
.title {
  font-size: clamp(34px, 3vw, 56px);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
  color: #2a2a2a;
}
.title-col {
  display: flex;
  align-items: flex-start;
}
.mobile-title {
  margin-bottom: 18px;
}

/* common banner */
.banner {
  position: relative;
  display: block;
  border-radius: 22px;
  overflow: hidden;
  min-height: 180px;
  text-decoration: none;
  color: #fff;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.1);
  background-size: cover;
  background-position: center;
}

/* soft dark overlay (so text readable) */
.banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.05));
  pointer-events: none;
}

/* circle arrow button */
.circle-btn {
  position: absolute;
  left: 22px;
  top: 60%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;
}
.circle-btn.right {
  left: auto;
  right: 22px;
}

/* banner titles */
.banner-title {
  position: absolute;
  left: 28px;
  top: 32px;
  z-index: 2;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* backgrounds from your assets */

/* youtube overlay text image */
.yt-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  align-items: center;
  justify-items: start;
  padding-left: 90px; /* leaves space for arrow button */
}
.yt-text {
  width: min(520px, 78%);
  height: auto;
  display: block;
}
.mobile-yt {
  padding-left: 84px;
}

/* sns block */
.sns-block {
  position: absolute;
  left: 28px;
  top: 28px;
  z-index: 2;
}
.sns-title {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.sns-sub {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  opacity: 0.95;
}
.sns-icons {
  margin-top: 18px;
  display: flex;
  gap: 14px;
  align-items: center;
}
.sns-icons :deep(.v-icon) {
  font-size: 26px;
  opacity: 0.95;
}

/* desktop grid (like original site) */
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  align-items: stretch;
}
.span-2 {
  grid-column: span 2;
}
.banner-yt.span-2 {
  min-height: 240px;
}
.banner-sns.span-2 {
  min-height: 220px;
}

/* mobile layout: 4 stacked banners */
.mobile {
  display: grid;
  gap: 16px;
}
.mobile-banner {
  min-height: 160px;
}

/* small tweaks */
@media (max-width: 600px) {
  .banner-title {
    font-size: 22px;
  }
  .sns-title {
    font-size: 26px;
  }
  .yt-text {
    width: min(460px, 78%);
  }
}

/* accessibility helper */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 960px) {
  .circle-btn {
    top: 50%;
  }
  .circle-btn-pos {
    top: 75%;
  }
}

@media (min-width: 1280px) {
  .circle-btn-pos {
    top: 50%;
  }
}
</style>
