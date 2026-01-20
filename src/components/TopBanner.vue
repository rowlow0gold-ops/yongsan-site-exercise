<template>
  <div class="top">
    <v-container class="nav-inner d-flex align-center py-0">
      <div class="top-content">
        <v-img :src="flagUrl" width="22" height="14" class="flag" contain />
        <span class="top-text"
          >이 누리집은 대한민국 공식 전자정부 누리집이 아닙니다.</span
        >
      </div>
    </v-container>
  </div>
</template>

<script setup>
import flagUrl from "../assets/top_ban_ico_flag.svg";
</script>

<style scoped>
.top {
  width: 100%;
  min-height: 24px;
  display: flex;
  align-items: center; /* vertical center */
  background-color: #edf1f5 !important;
  border-bottom: 1px solid #ddd !important;
}

.nav-inner {
  max-width: 1440px; /* adjust to match the site (1280~1440 common) */
  margin: 0 auto; /* centers the whole header content */
  padding: 0 16px; /* mobile inset */
}

.top-content {
  display: flex;
  align-items: center;
}

.top-text {
  font-size: 13px;
  line-height: 1; /* avoid extra vertical space */
  display: flex;
  align-items: center;
}

.flag {
  flex-shrink: 0; /* prevent shrinking */
  margin-right: 8px;
}
</style>
