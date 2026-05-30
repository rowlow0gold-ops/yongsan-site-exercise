<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { resendVerificationApi, verifyEmailApi, meApi } from "@/api/auth";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "이메일 인증", description: "6자리 인증 코드를 입력해주세요.", path: "/verify-pending" });

const auth = useAuthStore();
const router = useRouter();
const { open } = useAlert();

// 6 individual digit boxes — Microsoft / Apple / Google all use this pattern.
const digits = ref(["", "", "", "", "", ""]);
const inputs = ref([]); // template refs to each <input>
const sending = ref(false);
const verifying = ref(false);
const error = ref("");

const fullCode = computed(() => digits.value.join(""));
const canSubmit = computed(() => /^\d{6}$/.test(fullCode.value) && !verifying.value);

// 60-second cooldown after each resend so users can't spam-click. Backend
// also enforces 3/hour via rate-limit, but the UI feedback is what
// stops accidental double-clicks.
const RESEND_COOLDOWN = 60;
const cooldownLeft = ref(0);
let cooldownTimer = null;
function startCooldown() {
  cooldownLeft.value = RESEND_COOLDOWN;
  // Persist so a page refresh respects the cooldown
  sessionStorage.setItem("verify-resend-until", String(Date.now() + RESEND_COOLDOWN * 1000));
  clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    cooldownLeft.value = Math.max(0, cooldownLeft.value - 1);
    if (cooldownLeft.value === 0) clearInterval(cooldownTimer);
  }, 1000);
}
onMounted(() => {
  const until = Number(sessionStorage.getItem("verify-resend-until") || 0);
  const remaining = Math.ceil((until - Date.now()) / 1000);
  if (remaining > 0) {
    cooldownLeft.value = remaining;
    cooldownTimer = setInterval(() => {
      cooldownLeft.value = Math.max(0, cooldownLeft.value - 1);
      if (cooldownLeft.value === 0) clearInterval(cooldownTimer);
    }, 1000);
  }
});
onUnmounted(() => clearInterval(cooldownTimer));

function onInput(idx, e) {
  const v = e.target.value.replace(/\D/g, "").slice(-1); // last digit only
  digits.value[idx] = v;
  error.value = "";
  if (v && idx < 5) inputs.value[idx + 1]?.focus();
  if (fullCode.value.length === 6) verify();
}

function onKeydown(idx, e) {
  if (e.key === "Backspace" && !digits.value[idx] && idx > 0) {
    inputs.value[idx - 1]?.focus();
  } else if (e.key === "ArrowLeft" && idx > 0) {
    inputs.value[idx - 1]?.focus();
  } else if (e.key === "ArrowRight" && idx < 5) {
    inputs.value[idx + 1]?.focus();
  }
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
    const { data } = await verifyEmailApi(fullCode.value);
    if (data?.ok) {
      // Refresh auth.user so emailVerified flips to true on this tab.
      try { const { data: me } = await meApi(); auth.setUser(me); } catch (_) {}
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
  sending.value = true;
  try {
    const { data } = await resendVerificationApi();
    open(data?.message || "새 인증 코드를 보냈습니다.", "success");
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
    // Still start cooldown to discourage rapid retries on errors too.
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
      <p class="text-body-2 text-medium-emphasis mb-2">
        <strong>{{ auth.user?.email || "" }}</strong>로 6자리 인증 코드를 보냈습니다.
      </p>
      <p class="text-body-2 text-medium-emphasis mb-5">
        메일이 보이지 않으면 스팸함도 확인해보세요. 코드는 10분 동안 유효합니다.
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

      <v-btn block color="primary" size="large" class="mb-2" :loading="verifying" :disabled="!canSubmit" @click="verify">
        인증 완료
      </v-btn>
      <v-btn block variant="outlined" :loading="sending"
             :disabled="cooldownLeft > 0 || sending" @click="resend">
        <template v-if="cooldownLeft > 0">
          {{ cooldownLeft }}초 후 다시 보내기
        </template>
        <template v-else>
          인증 코드 다시 보내기
        </template>
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
.code-cell:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}
@media (max-width: 480px) {
  .code-cell { width: 40px; height: 48px; font-size: 24px; }
  .code-grid { gap: 6px; }
}
</style>
