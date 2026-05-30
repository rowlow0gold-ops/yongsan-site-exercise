<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
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

// --- Cloudflare Turnstile (explicit render) ---
const TURNSTILE_SITEKEY = "0x4AAAAAADYJm08LeNJZIsCY";
const turnstileBox = ref(null);
const turnstileToken = ref("");
let turnstileWidgetId = null;
function ensureTurnstileScript() {
  if (document.getElementById("cf-turnstile-script")) return;
  const s = document.createElement("script");
  s.id = "cf-turnstile-script";
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  s.async = true; s.defer = true;
  document.head.appendChild(s);
}
function mountTurnstile() {
  if (!turnstileBox.value) return;
  if (!window.turnstile) { setTimeout(mountTurnstile, 200); return; }
  if (turnstileWidgetId != null) {
    try { window.turnstile.reset(turnstileWidgetId); } catch (_) {}
    return;
  }
  turnstileWidgetId = window.turnstile.render(turnstileBox.value, {
    sitekey: TURNSTILE_SITEKEY,
    callback: (t) => { turnstileToken.value = t || ""; },
    "error-callback":   () => { turnstileToken.value = ""; },
    "expired-callback": () => { turnstileToken.value = ""; },
  });
}
function unmountTurnstile() {
  turnstileToken.value = "";
  if (window.turnstile && turnstileWidgetId != null) {
    try { window.turnstile.remove(turnstileWidgetId); } catch (_) {}
  }
  turnstileWidgetId = null;
}
onMounted(async () => {
  ensureTurnstileScript();
  await nextTick();
  mountTurnstile();
});
onUnmounted(unmountTurnstile);

const canSubmit = computed(() =>
  !submitting.value && EMAIL_RE.test(email.value) && !!turnstileToken.value
);

async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    await requestPasswordResetApi(email.value.trim(), turnstileToken.value);
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
  <div class="forgot-page">
    <v-card class="pa-6" rounded="xl" max-width="480" width="100%">
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

      <div class="ts-frame mb-4">
        <div ref="turnstileBox" style="min-height: 65px" />
      </div>
      <div v-if="!turnstileToken" class="text-caption text-error mb-3">
        사람 확인을 완료해주세요.
      </div>

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
  </div>
</template>

<style scoped>
.forgot-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
</style>
