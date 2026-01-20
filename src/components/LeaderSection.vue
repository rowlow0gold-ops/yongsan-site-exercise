<script setup>
import leaderBg from "../assets/leader_bg.png";
import leaderImg from "../assets/leader_b.png";
import { useDisplay } from "vuetify";

const { smAndUp } = useDisplay();

const leaderLinks = {
  main: "",
  wish: "",
  intro: "",
  manifesto: "",
};
</script>

<template>
  <v-card class="leader-card" elevation="0">
    <!-- HERO -->
    <v-card
      class="leader-hero"
      elevation="0"
      :href="leaderLinks.main || undefined"
      :link="Boolean(leaderLinks.main)"
      target="_blank"
      rel="noopener"
      :style="{
        backgroundImage: `
          url(${leaderBg}),
          linear-gradient(
            to bottom right,
            rgba(255, 220, 230, 0.85),
            rgba(255, 180, 205, 0.9)
          )
        `,
        backgroundPosition: 'left center, center',
        backgroundSize: 'contain, cover',
        backgroundRepeat: 'no-repeat, no-repeat',
      }"
    >
      <!-- TEXT -->
      <div class="leader-text">
        <p class="sub">새로운 용산,<br />소통하는 구청장!</p>
        <p class="leader-name">
          용산구청장<br />
          <span class="leader-nm">박희영</span>입니다.
        </p>
      </div>

      <!-- LEADER IMAGE (always right, overlaps if needed) -->
      <v-img
        :src="leaderImg"
        class="leader-img"
        contain
        alt="용산구청장 박희영"
      />
    </v-card>

    <!-- QUICK MENU (always 1 row / 3 columns, shrink on tiny width) -->
    <v-card class="quick-menu" elevation="0">
      <div class="quick-row">
        <v-btn
          class="quick-btn"
          variant="text"
          :href="leaderLinks.wish || undefined"
          :ripple="false"
          target="_blank"
          rel="noopener"
        >
          <div class="quick-text">구청장에게<br />바란다</div>
        </v-btn>

        <v-divider vertical class="quick-divider" />

        <v-btn
          class="quick-btn"
          variant="text"
          :href="leaderLinks.intro || undefined"
          :ripple="false"
          target="_blank"
          rel="noopener"
        >
          <div class="quick-text">박희영<br />입니다</div>
        </v-btn>

        <v-divider vertical class="quick-divider" />

        <v-btn
          class="quick-btn"
          variant="text"
          :href="leaderLinks.manifesto || undefined"
          :ripple="false"
          target="_blank"
          rel="noopener"
        >
          <div class="quick-text">매니페스토<br />(약속과 실천)</div>
        </v-btn>
      </div>
    </v-card>
  </v-card>
</template>

<style scoped>
/* Whole component fills its parent, hero takes remaining space */
.leader-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* HERO */
.leader-hero {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  overflow: hidden;

  border-radius: 25px 77px 0 0;
  box-shadow: 3px 6px 9px 1px rgba(0, 0, 0, 0.13);

  padding: 24px;

  /* keep background settings (overridden by inline backgroundImage, but these are safe defaults) */
  background-repeat: no-repeat, no-repeat;
  background-size: contain, cover;
  background-position: left center, center;
}

/* Text */
.leader-text {
  position: absolute;
  left: 6%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;

  max-width: 40%;

  transform: translateY(-50%) scale(1.15);
  transform-origin: left center;
}
@media (max-width: 600px) {
  .leader-text {
    left: 16px;
    max-width: 60%;
    top: 55%;
  }
}

.sub {
  font-size: 18px;
  line-height: 1.25;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.leader-name {
  font-size: 16px;
  line-height: 1.25;
  margin: 0;
  font-weight: 500;
}
.leader-nm {
  font-size: 22px;
  font-weight: 800;
}

@media (max-width: 600px) {
  .sub {
    font-size: 12px;
  }

  .leader-name,
  .leader-nm {
    font-size: 16px;
  }
}

/* Leader image */
.leader-img {
  position: absolute;
  right: 3vw;
  bottom: 0;
  width: 320px;
  max-width: 52%;
  height: auto;
  max-height: 100%;
  z-index: 2;
  pointer-events: none;
}

/* QUICK MENU */
.quick-menu {
  flex: 0 0 auto;
  background-color: #e14979;
  border-radius: 0 0 25px 25px !important;
  overflow: hidden; /* keep card stable, clip if ultra tiny */
}

/* Always one row */
.quick-row {
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
}

/* Buttons must be allowed to shrink */
.quick-btn {
  flex: 1 1 0;
  min-width: 0 !important;
  min-height: 50px;
  border-radius: 0;
  text-transform: none;

  /* shrink padding when width is tiny */
  padding-inline: clamp(2px, 1.4vw, 12px) !important;
  padding-block: clamp(2px, 1vw, 10px) !important;
}

@media (max-width: 600px) {
  .quick-btn {
    min-height: 10px;
  }
}

/* Divider stays vertical always (since we never wrap) */
.quick-divider {
  align-self: stretch;
  width: 1px;
  opacity: 0.5;
}

/* Text shrinks smoothly when extremely narrow */
.quick-text {
  width: 100%;
  text-align: center;
  color: #fff;

  font-size: clamp(8px, 2.6vw, 14px);
  line-height: 1.05;
  font-weight: 600;
  word-break: keep-all;
}
</style>
