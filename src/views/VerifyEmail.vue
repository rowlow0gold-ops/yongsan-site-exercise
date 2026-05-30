<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { verifyEmailApi } from "@/api/auth";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "이메일 인증", description: "이메일 인증 처리", path: "/verify" });

const route = useRoute();
const router = useRouter();

// Three states: "verifying" (initial), "ok", "error"
const state = ref("verifying");
const message = ref("");

onMounted(async () => {
  const token = route.query.token;
  if (!token) {
    state.value = "error";
    message.value = "인증 토큰이 없습니다.";
    return;
  }
  try {
    const { data } = await verifyEmailApi(String(token));
    if (data?.ok) {
      state.value = "ok";
      message.value = data?.message || "이메일 인증 완료!";
    } else {
      state.value = "error";
      message.value = data?.message || "인증에 실패했습니다.";
    }
  } catch (e) {
    state.value = "error";
    message.value = e?.response?.data?.message || "유효하지 않거나 만료된 인증 링크입니다.";
  }
});

function goHome() { router.push("/"); }
</script>

<template>
  <div class="verify-page">
    <v-card class="pa-6 text-center" rounded="xl" max-width="480">
      <template v-if="state === 'verifying'">
        <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
        <h2 class="text-h6 mb-2">이메일 인증 중...</h2>
        <p class="text-body-2 text-medium-emphasis">잠시만 기다려주세요.</p>
      </template>

      <template v-else-if="state === 'ok'">
        <v-icon size="64" color="success" class="mb-2">mdi-check-circle</v-icon>
        <h2 class="text-h6 mb-2">{{ message }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-5">
          이제 모든 회원 기능을 이용하실 수 있습니다.
        </p>
        <v-btn color="primary" size="large" block @click="goHome">홈으로</v-btn>
      </template>

      <template v-else>
        <v-icon size="64" color="error" class="mb-2">mdi-alert-circle</v-icon>
        <h2 class="text-h6 mb-2">인증 실패</h2>
        <p class="text-body-2 text-medium-emphasis mb-5">{{ message }}</p>
        <v-btn variant="outlined" block @click="goHome">홈으로</v-btn>
      </template>
    </v-card>
  </div>
</template>

<style scoped>
.verify-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
</style>
