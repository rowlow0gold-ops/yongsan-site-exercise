<template>
  <div class="nf-wrap">
    <div class="nf-card">
      <div class="nf-code">404</div>
      <h1 class="nf-title">페이지를 찾을 수 없습니다</h1>
      <p class="nf-desc">
        요청하신 주소의 페이지가 존재하지 않거나, 이동·삭제되었을 수 있습니다.
      </p>
      <div class="nf-actions">
        <v-btn color="primary" size="large" prepend-icon="mdi-home" @click="$router.push('/')">홈으로</v-btn>
        <v-btn variant="outlined" size="large" prepend-icon="mdi-arrow-left" @click="$router.back()">이전 페이지</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "페이지를 찾을 수 없습니다", description: "요청하신 페이지를 찾을 수 없습니다.", path: "/404" });
</script>

<style scoped>
.nf-wrap {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}
.nf-card {
  text-align: center;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid #eef2f7;
}
.nf-code {
  font-size: 88px;
  font-weight: 800;
  line-height: 1;
  color: #2f5597;
  letter-spacing: -2px;
  margin-bottom: 8px;
}
.nf-title {
  font-size: 22px;
  margin: 8px 0 12px;
  color: #1f2937;
}
.nf-desc {
  color: #6b7280;
  margin: 0 0 28px;
}
.nf-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
