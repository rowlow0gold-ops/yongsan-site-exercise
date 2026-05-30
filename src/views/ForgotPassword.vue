<script setup>
import { ref, computed } from "vue";
import { requestPasswordResetApi } from "@/api/auth";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "비밀번호 재설정", description: "비밀번호 재설정 링크 요청", path: "/forgot-password" });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const email = ref("");
const submitting = ref(false);
const submitted = ref(false);

const emailError = computed(() => {
  const v = email.value;
  if (!v) return "";
  if (!EMAIL_RE.test(v)) return "올바른 이메일 형식이 아닙니다.";
  return "";
});
const canSubmit = computed(() => !submitting.value && EMAIL_RE.test(email.value));

async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    await requestPasswordResetApi(email.value.trim());
  } catch (_) {
    // server always returns 200 — failure here is a network issue, not a
    // "no such email" hint. We still flip to submitted state to avoid leaking
    // anything.
  } finally {
    submitting.value = false;
    submitted.value = true;
  }
}
</script>

<template>
  <v-card class="pa-6" rounded="xl" max-width="480">
    <h2 class="text-h6 mb-2">비밀번호 재설정</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      가입하신 이메일 주소를 입력해주세요. 등록된 계정이라면 비밀번호 재설정 링크를 보내드립니다.
    </p>

    <template v-if="!submitted">
      <label class="field-label">이메일</label>
      <v-text-field
        v-model="email"
        type="email"
        placeholder="you@example.com"
        variant="outlined"
        :error-messages="emailError"
        :error="!!emailError"
        hide-details="auto"
        class="mb-4"
        autofocus
        @keyup.enter="submit"
      />
      <v-btn
        block color="primary" size="large"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="submit"
      >
        재설정 링크 받기
      </v-btn>
    </template>

    <template v-else>
      <v-alert type="success" variant="tonal" class="mb-4">
        입력하신 이메일이 등록되어 있다면 재설정 링크를 보내드렸습니다.
        이메일을 확인해주세요. (최대 1-2분 소요)
      </v-alert>
      <p class="text-caption text-medium-emphasis mb-0">
        스팸함도 확인해보세요. 메일이 1시간 동안 도착하지 않으면 다시 시도해주세요.
      </p>
    </template>
  </v-card>
</template>

<style scoped>
.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
</style>
