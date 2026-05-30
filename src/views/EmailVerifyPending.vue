<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { resendVerificationApi, verifyEmailApi } from "@/api/auth";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "이메일 인증", description: "6자리 인증 코드를 입력해주세요.", path: "/verify-pending" });

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { open } = useAlert();

// Email is set from ?email= query (login redirect) OR ?email= via signup
// path. It's READ-ONLY here — users can't change it on this page. If they
// landed here without an email parameter, we bounce them to /login because
// that means they're trying to verify someone-else's-account by guessing.
const email = ref(String(route.query.email || ""));
if (!email.value) {
  router.replace({ name: "home" });
}

// Code expiry — server tells us when the most recent code expires on
// every resend. We start with a 10-minute optimistic estimate.
const expiresAt = ref(Date.now() + 10 * 60 * 1000);
const now = ref(Date.now());
let nowTimer = null;
const codeRemaining = computed(() => Math.max(0, Math.floor((expiresAt.value - now.value) / 1000)));
const codeRemainingPretty = computed(() => {
  const s = codeRemaining.value;
  return `${Math.floor(s / 60)}분 ${String(s % 60).padStart(2, "0")}초`;
});

// 6-digit code input
const digits = ref(["", "", "", "", "", ""]);
const inputs = ref([]);
const sending = ref(false);
const verifying = ref(false);
const error = ref("");

const fullCode = computed(() => digits.value.join(""));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmailValid = computed(() => EMAIL_RE.test(email.value || ""));
const canSubmit = computed(() =>
  isEmailValid.value && /^\d{6}$/.test(fullCode.value) && !verifying.value && codeRemaining.value > 0
);

// 60s resend cooldown — sessionStorage so refresh respects it
const RESEND_COOLDOWN = 60;
const cooldownLeft = ref(0);
let cooldownTimer = null;
function startCooldown() {
  cooldownLeft.value = RESEND_COOLDOWN;
  sessionStorage.setItem("verify-resend-until", String(Date.now() + RESEND_COOLDOWN * 1000));
  clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    cooldownLeft.value = Math.max(0, cooldownLeft.value - 1);
    if (cooldownLeft.value === 0) clearInterval(cooldownTimer);
  }, 1000);
}
onMounted(() => {
  // 1-second tick for the code expiry countdown
  nowTimer = setInterval(() => (now.value = Date.now()), 1000);

  const until = Number(sessionStorage.getItem("verify-resend-until") || 0);
  const remaining = Math.ceil((until - Date.now()) / 1000);
  if (remaining > 0) {
    cooldownLeft.value = remaining;
    cooldownTimer = setInterval(() => {
      cooldownLeft.value = Math.max(0, cooldownLeft.value - 1);
      if (cooldownLeft.value === 0) clearInterval(cooldownTimer);
    }, 1000);
  }
  if (email.value) inputs.value[0]?.focus();
});
onUnmounted(() => {
  clearInterval(cooldownTimer);
  clearInterval(nowTimer);
});

function onInput(idx, e) {
  const v = e.target.value.replace(/\D/g, "").slice(-1);
  digits.value[idx] = v;
  error.value = "";
  if (v && idx < 5) inputs.value[idx + 1]?.focus();
  if (fullCode.value.length === 6) verify();
}
function onKeydown(idx, e) {
  if (e.key === "Backspace" && !digits.value[idx] && idx > 0) inputs.value[idx - 1]?.focus();
  else if (e.key === "ArrowLeft" && idx > 0) inputs.value[idx - 1]?.focus();
  else if (e.key === "ArrowRight" && idx < 5) inputs.value[idx + 1]?.focus();
}
async function onPaste(e) {
  const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
  if (!text) return;
  e.preventDefault();
  for (let i = 0; i < 6; i++) digits.value[i] = text[i] || "";
  await nextTick();
  const targetIdx = Math.min(text.length, 5);
  inputs.value[targetIdx]?.focus();
  if (text.length === 6) verify();
}

async function verify() {
  if (!canSubmit.value) return;
  verifying.value = true;
  error.value = "";
  try {
    const { data } = await verifyEmailApi(email.value.trim().toLowerCase(), fullCode.value);
    if (data?.ok) {
      // Server has set cookies + returned the user. Flip auth state and go home.
      if (data.user) auth.setAuth({ user: data.user });
      sessionStorage.removeItem("pending-verify-email");
      open(data?.message || "이메일 인증 완료!", "success");
      router.push("/");
    } else {
      error.value = data?.message || "인증에 실패했습니다.";
      digits.value = ["", "", "", "", "", ""];
      await nextTick();
      inputs.value[0]?.focus();
    }
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      (e?.response?.status === 429
        ? "잘못된 시도가 너무 많습니다. 새 인증 코드를 요청해주세요."
        : "인증에 실패했습니다.");
    digits.value = ["", "", "", "", "", ""];
    await nextTick();
    inputs.value[0]?.focus();
  } finally {
    verifying.value = false;
  }
}

async function resend() {
  if (sending.value || cooldownLeft.value > 0) return;
  if (!isEmailValid.value) {
    error.value = "이메일을 입력해주세요.";
    return;
  }
  sending.value = true;
  try {
    const { data } = await resendVerificationApi(email.value.trim().toLowerCase());
    if (data?.verificationExpiresAt) {
      expiresAt.value = new Date(data.verificationExpiresAt).getTime();
    } else {
      expiresAt.value = Date.now() + 10 * 60 * 1000;
    }
    open("입력하신 이메일이 등록되어 있다면 새 인증 코드를 보냈습니다.", "success");
    digits.value = ["", "", "", "", "", ""];
    error.value = "";
    startCooldown();
    await nextTick();
    inputs.value[0]?.focus();
  } catch (e) {
    open(
      e?.response?.status === 429
        ? "잠시 후 다시 시도해주세요."
        : "메일 발송에 실패했습니다.",
      "error"
    );
    startCooldown();
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="verify-pending-page">
    <v-card class="pa-6 text-center" rounded="xl" max-width="520" width="100%">
      <v-icon size="56" color="primary" class="mb-3">mdi-email-fast-outline</v-icon>
      <h2 class="text-h6 mb-2">이메일 인증을 완료해주세요</h2>
      <p class="text-body-2 text-medium-emphasis mb-3">
        가입하신 이메일로 6자리 인증 코드를 보냈습니다. 메일이 보이지 않으면 스팸함도 확인해보세요.
        코드는 10분 동안 유효합니다.
      </p>

      <p class="text-body-2 text-medium-emphasis mb-1">
        <strong>{{ email }}</strong>
      </p>
      <p v-if="codeRemaining > 0" class="text-body-2 text-medium-emphasis mb-4">
        코드 만료까지 <strong class="text-primary">{{ codeRemainingPretty }}</strong>
      </p>
      <p v-else class="text-body-2 text-error mb-4">
        코드가 만료되었습니다. 다시 보내기를 눌러 새 코드를 받아주세요.
      </p>

      <div class="code-grid" @paste="onPaste">
        <input
          v-for="(_, idx) in digits"
          :key="idx"
          :ref="(el) => inputs[idx] = el"
          v-model="digits[idx]"
          class="code-cell"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          :disabled="verifying"
          @input="(e) => onInput(idx, e)"
          @keydown="(e) => onKeydown(idx, e)"
        />
      </div>

      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="my-3">
        {{ error }}
      </v-alert>

      <v-btn block color="primary" size="large" class="mb-2"
             :loading="verifying" :disabled="!canSubmit" @click="verify">
        인증 완료
      </v-btn>
      <v-btn block variant="outlined" :loading="sending"
             :disabled="cooldownLeft > 0 || sending || !isEmailValid" @click="resend">
        <template v-if="cooldownLeft > 0">{{ cooldownLeft }}초 후 다시 보내기</template>
        <template v-else>인증 코드 다시 보내기</template>
      </v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.verify-pending-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
.code-grid {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 8px;
}
.code-cell {
  width: 48px;
  height: 56px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  font-family: 'Menlo', 'Consolas', monospace;
  color: #1f2937;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.code-cell:focus {
  outline: none;
  border-color: #2f5597;
  box-shadow: 0 0 0 3px rgba(47, 85, 151, 0.15);
}
.code-cell:disabled { background: #f3f4f6; color: #9ca3af; }
@media (max-width: 480px) {
  .code-cell { width: 40px; height: 48px; font-size: 24px; }
  .code-grid { gap: 6px; }
}
</style>
