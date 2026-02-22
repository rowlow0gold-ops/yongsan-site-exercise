<template>
  <div class="steps">
    <div class="title">회원가입</div>

    <div class="step" :class="{ active: step === 1 }">1. 약관 동의</div>
    <div class="step" :class="{ active: step === 2 }">2. 정보 입력</div>
    <div class="step" :class="{ active: step === 3 }">3. 완료</div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

// easiest UI-only: step can come from query (?step=2)
// later you can connect it to your Signup Stepper state via store
const route = useRoute()
const step = computed(() => Number(route.query.step || 1))
</script>

<style scoped>
.steps { padding: 18px; }
.title { font-weight: 800; margin-bottom: 14px; }
.step { padding: 10px 12px; border-radius: 10px; margin-bottom: 8px; background: #f5f6f8; }
.step.active { background: #2f5bea; color: white; font-weight: 700; }
</style>