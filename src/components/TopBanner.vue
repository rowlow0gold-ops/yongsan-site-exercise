<template>
  <v-app-bar height="36" flat location="top" class="top">
    <div class="top-content">
      <v-img :src="flagUrl" width="22" height="14" class="flag" contain />
      <span class="top-text">
        이 누리집은 대한민국 비공식 전자정부 누리집입니다.
      </span>
    </div>
  </v-app-bar>
</template>

<script setup>
import flagUrl from "../assets/top_ban_ico_flag.svg";
</script>

<style scoped>
.top {
  background-color: #edf1f5 !important;
  border-bottom: 1px solid #ddd;
}

.top-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: clamp(2px, 10vw, 10%);
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
