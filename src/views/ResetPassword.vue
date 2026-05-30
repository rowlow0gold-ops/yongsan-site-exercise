<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { confirmPasswordResetApi } from "@/api/auth";
import { useAlert } from "@/composables/useAlert";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "새 비밀번호 설정", description: "비밀번호 재설정", path: "/reset-password" });

const route = useRoute();
const router = useRouter();
const { open } = useAlert();

const token = String(route.query.token || "");

const pw = ref("");
const pw2 = ref("");
const show = ref(false);
const submitting = ref(false);
const error = ref("");

const pwError = computed(() => {
  const v = pw.value;
  if (!v) return "";
  if (v.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (v.length > 128) return "비밀번호는 128자 이하여야 합니다.";
  if (!/[A-Za-z]/.test(v)) return "영문자를 포함해야 합니다.";
  if (!/\d/.test(v)) return "숫자를 포함해야 합니다.";
  if (/(.)\1{5,}/.test(v)) return "같은 문자가 너무 반복됩니다.";
  return "";
});
const pw2Error = computed(() => {
  if (!pw2.value) return "";
  if (pw.value !== pw2.value) return "비밀번호가 일치하지 않습니다.";
  return "";
});

const strength = computed(() => {
  const v = pw.value || "";
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 16) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
  const labels = ["매우 약함", "약함", "보통", "좋음", "강함"];
  const colors = ["error", "error", "warning", "info", "success"];
  return { score: s, label: labels[s], color: colors[s] };
});

const canSubmit = computed(() =>
  !submitting.value && !!token && pw.value === pw2.value && !pwError.value && pw.value
);

async function submit() {
  if (!canSubmit.value) return;
  error.value = "";
  submitting.value = true;
  try {
    await confirmPasswordResetApi(token, pw.value);
    open("비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.", "success");
    router.push("/");
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      "재설정에 실패했습니다. 링크가 만료되었거나 잘못된 비밀번호입니다.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <v-card class="pa-6" rounded="xl" max-width="480">
    <h2 class="text-h6 mb-2">새 비밀번호 설정</h2>

    <v-alert v-if="!token" type="error" variant="tonal">
      유효하지 않은 링크입니다. 비밀번호 재설정을 처음부터 다시 진행해주세요.
    </v-alert>

    <template v-else>
      <p class="text-body-2 text-medium-emphasis mb-4">
        영문자와 숫자를 모두 포함한 8자 이상의 새 비밀번호를 입력해주세요.
      </p>

      <label class="field-label">새 비밀번호</label>
      <v-text-field
        v-model="pw"
        :type="show ? 'text' : 'password'"
        placeholder="영문/숫자 포함 8자 이상"
        variant="outlined"
        :error-messages="pwError"
        :error="!!pwError"
        hide-details="auto"
        autocomplete="new-password"
        class="mb-2"
        :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="show = !show"
      />
      <div v-if="pw" class="mt-1 mb-3">
        <v-progress-linear
          :model-value="strength.score * 25"
          :color="strength.color"
          height="6"
          rounded
        />
        <div class="text-caption mt-1" :class="`text-${strength.color}`">
          {{ strength.label }}
        </div>
      </div>

      <label class="field-label">새 비밀번호 확인</label>
      <v-text-field
        v-model="pw2"
        :type="show ? 'text' : 'password'"
        placeholder="다시 한 번 입력해주세요"
        variant="outlined"
        :error-messages="pw2Error"
        :error="!!pw2Error"
        hide-details="auto"
        autocomplete="new-password"
        class="mb-4"
        @keyup.enter="submit"
      />

      <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>

      <v-btn block color="primary" size="large" :loading="submitting" :disabled="!canSubmit" @click="submit">
        비밀번호 변경
      </v-btn>
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
