<template>
  <v-card rounded="xl" class="pa-6">
    <div class="text-h6 font-weight-bold mb-6">회원가입</div>

    <v-stepper v-model="step" rounded="xl" elevation="0">
      <v-stepper-header>
        <v-stepper-item :value="1" title="약관동의" />
        <v-divider />
        <v-stepper-item :value="2" title="기본정보" />
        <v-divider />
        <v-stepper-item :value="3" title="이메일 인증" />
        <v-divider />
        <v-stepper-item :value="4" title="완료" />
      </v-stepper-header>

      <v-stepper-window>
        <!-- STEP 1 -->
        <v-stepper-window-item :value="1">
          <v-checkbox v-model="agreeAll" label="전체 동의" />
          <v-checkbox v-model="agreeTerms" label="이용약관 동의 (필수)" />
          <v-checkbox
            v-model="agreePrivacy"
            label="개인정보 처리방침 동의 (필수)"
          />
          <v-checkbox
            v-model="agreeMarketing"
            label="마케팅 수신 동의 (선택)"
          />

          <div class="d-flex justify-end mt-6">
            <v-btn color="primary" :disabled="!canGoStep2" @click="step = 2">
              다음
            </v-btn>
          </div>
        </v-stepper-window-item>

        <!-- STEP 2 -->
        <v-stepper-window-item :value="2">
          <v-form ref="formRef" v-model="formValid" @submit.prevent="finishSignup">
            <v-row>
              <v-col cols="12" md="6">
                <label class="field-label">이름</label>
                <v-text-field
                  v-model="form.name"
                  placeholder="홍길동"
                  variant="outlined"
                  :rules="nameRules"
                  :error-messages="nameError"
                  :error="!!nameError"
                  required
                  counter="50"
                  maxlength="50"
                  validate-on="input lazy"
                  hide-details="auto"
                  name="signup-name"
                  autocomplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </v-col>
              <v-col cols="12" md="6">
                <label class="field-label">이메일</label>
                <v-text-field
                  v-model="form.email"
                  name="email"
                  autocomplete="username"
                  placeholder="you@example.com"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                  :error-messages="emailError"
                  :error="!!emailError"
                  required
                  validate-on="input lazy"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="6">
                <label class="field-label">비밀번호</label>
                <v-text-field
                  v-model="form.password"
                  placeholder="영문/숫자 포함 8자 이상"
                  :type="showPassword ? 'text' : 'password'"
                  name="new-password"
                  autocomplete="new-password"
                  variant="outlined"
                  :rules="passwordRules"
                  :error-messages="passwordError"
                  :error="!!passwordError"
                  required
                  validate-on="input lazy"
                  hide-details="auto"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />
                <!-- Inline strength meter so the user sees progress as they type. -->
                <div v-if="form.password" class="mt-1 mb-2">
                  <v-progress-linear
                    :model-value="passwordStrength.score * 25"
                    :color="passwordStrength.color"
                    height="6"
                    rounded
                  />
                  <div class="text-caption mt-1" :class="`text-${passwordStrength.color}`">
                    {{ passwordStrength.label }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <label class="field-label">비밀번호 확인</label>
                <v-text-field
                  v-model="form.password2"
                  placeholder="다시 한 번 입력해주세요"
                  :type="showPassword2 ? 'text' : 'password'"
                  name="new-password-confirm"
                  autocomplete="new-password"
                  variant="outlined"
                  :rules="password2Rules"
                  :error-messages="password2Error"
                  :error="!!password2Error"
                  required
                  validate-on="input lazy"
                  hide-details="auto"
                  :append-inner-icon="showPassword2 ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword2 = !showPassword2"
                />

              </v-col>
            </v-row>

            <v-alert v-if="submitError" type="error" variant="tonal" class="mt-3">
              {{ submitError }}
            </v-alert>

            <div class="d-flex justify-space-between mt-6">
              <v-btn variant="outlined" :disabled="submitting" @click="step = 1">이전</v-btn>
              <v-btn
                color="primary"
                type="submit"
                :disabled="!canFinish"
                :loading="submitting"
              >
                완료
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>

        <!-- STEP 3 — Email verification (locked email + 6-digit code + countdown) -->
        <v-stepper-window-item :value="3">
          <div class="text-center pa-2 verify-step">
            <v-icon size="48" color="primary" class="mb-2">mdi-email-fast-outline</v-icon>
            <h3 class="text-subtitle-1 mb-2">이메일로 보낸 6자리 코드를 입력해주세요</h3>
            <p class="text-body-2 text-medium-emphasis mb-1">
              <strong>{{ verifyEmailLocked }}</strong>
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
                @input="(e) => onCodeInput(idx, e)"
                @keydown="(e) => onCodeKeydown(idx, e)"
              />
            </div>

            <v-alert v-if="verifyError" type="error" variant="tonal" density="compact" class="my-3">
              {{ verifyError }}
            </v-alert>

            <v-btn block color="primary" size="large" class="mb-2 mt-2"
                   :loading="verifying" :disabled="!canSubmitCode" @click="submitCode">
              인증 완료
            </v-btn>
            <v-btn block variant="outlined" :loading="resendingCode"
                   :disabled="resendCooldownLeft > 0 || resendingCode" @click="resendCode">
              <template v-if="resendCooldownLeft > 0">
                {{ resendCooldownLeft }}초 후 다시 보내기
              </template>
              <template v-else>
                인증 코드 다시 보내기
              </template>
            </v-btn>
            <v-btn block variant="text" size="small" class="mt-2" @click="step = 2">
              이메일 변경
            </v-btn>
          </div>
        </v-stepper-window-item>

        <!-- STEP 4 — Done -->
        <v-stepper-window-item :value="4">
          <v-alert type="success" variant="tonal" class="mb-6">
            회원가입이 완료되었습니다! 🎉
          </v-alert>

          <div class="d-flex justify-end">
            <v-btn color="primary" @click="$router.push('/')">홈으로</v-btn>
          </div>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { signupApi, verifyEmailApi, resendVerificationApi } from "@/api/auth";
import { useAlert } from "@/composables/useAlert";
import { useAuthStore } from "@/stores/auth";
import { useLeaveGuard } from "@/composables/useLeaveGuard";
import { useSeo } from "@/composables/useSeo";
const auth = useAuthStore();
const { open } = useAlert();
useSeo({ title: "회원가입", description: "용산구 홈페이지 회원가입", path: "/signup" });

const router = useRouter();
const route = useRoute();

// ✅ step sync with left sidebar via query (?step=1/2/3)
const step = ref(Number(route.query.step || 1));

watch(step, (v) => {
  router.replace({ query: { ...route.query, step: String(v) } });
});

const agreeAll = ref(false);
const agreeTerms = ref(false);
const agreePrivacy = ref(false);
const agreeMarketing = ref(false);

watch(agreeAll, (v) => {
  agreeTerms.value = v;
  agreePrivacy.value = v;
  agreeMarketing.value = v;
});

const canGoStep2 = computed(() => agreeTerms.value && agreePrivacy.value);

// Guard against direct URL access to ?step=2 without consenting to step 1.
// If someone types /signup?step=2, force them back to step 1 — they have to
// actually check the required boxes before basic-info opens.
watch(step, (s) => {
  if (s >= 2 && !canGoStep2.value) {
    step.value = 1;
  }
}, { immediate: true });

// Leave guard — warn on any back/refresh/close until the whole flow is done.
// Steps that should warn:
//   2 — form has data → losing the typed info
//   3 — account exists but unverified → losing in-flight verification
// markSubmitted() only fires when we reach step 4 (verified, logged in).
const { markSubmitted } = useLeaveGuard(
  () =>
    (step.value === 2 && !!(form.name || form.email || form.password))
    || step.value === 3,
  "작성 중인 내용이 사라집니다. 페이지를 떠나시겠습니까?"
);

const form = reactive({
  name: "",
  email: "",
  password: "",
  password2: "",
});

const formRef = ref(null);
const formValid = ref(false);
const showPassword = ref(false);
const showPassword2 = ref(false);
const submitting = ref(false);
const submitError = ref("");

// --- Validation rules ---
// Real email regex is endless; this catches the obvious garbage
// ("sadasdasd") without rejecting valid odd-looking addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const nameRules = [
  (v) => (!!v && v.trim().length > 0) || "이름을 입력해주세요.",
  (v) => v.trim().length >= 2 || "이름은 2자 이상이어야 합니다.",
  (v) => v.length <= 50 || "이름은 50자 이하여야 합니다.",
];

const emailRules = [
  (v) => !!v || "이메일을 입력해주세요.",
  (v) => EMAIL_RE.test(v || "") || "올바른 이메일 형식이 아닙니다.",
  (v) => (v || "").length <= 254 || "이메일이 너무 깁니다.",
];

const passwordRules = [
  (v) => !!v || "비밀번호를 입력해주세요.",
  (v) => (v || "").length >= 8 || "비밀번호는 8자 이상이어야 합니다.",
  (v) => (v || "").length <= 128 || "비밀번호는 128자 이하여야 합니다.",
  (v) => /[A-Za-z]/.test(v || "") || "영문자를 포함해야 합니다.",
  (v) => /\d/.test(v || "") || "숫자를 포함해야 합니다.",
];

// password2 rules close over form.password so confirmation re-validates
// whenever the original password field is edited.
const password2Rules = [
  (v) => !!v || "비밀번호 확인을 입력해주세요.",
  (v) => v === form.password || "비밀번호가 일치하지 않습니다.",
];

// Re-validate the confirm field as the user types in the password field,
// otherwise the "mismatch" error sticks even after you fix it.
watch(() => form.password, () => {
  if (formRef.value && form.password2) {
    // nextTick avoids fighting Vuetify's own internal state update
    Promise.resolve().then(() => formRef.value?.validate?.());
  }
});

// --- Bulletproof error display ---
// We compute the error message for each field explicitly and bind it to
// :error-messages. This bypasses any quirks in Vuetify's rules-touched
// state machine so errors are guaranteed visible as soon as the field
// has content the rules reject.
const nameError = computed(() => {
  const v = form.name;
  if (!v) return ""; // empty = pristine, don't show error
  if (v.trim().length < 2) return "이름은 2자 이상이어야 합니다.";
  if (v.length > 50) return "이름은 50자 이하여야 합니다.";
  return "";
});

const emailError = computed(() => {
  const v = form.email;
  if (!v) return "";
  if (!EMAIL_RE.test(v)) return "올바른 이메일 형식이 아닙니다.";
  if (v.length > 254) return "이메일이 너무 깁니다.";
  return "";
});

const passwordError = computed(() => {
  const v = form.password;
  if (!v) return "";
  if (v.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (v.length > 128) return "비밀번호는 128자 이하여야 합니다.";
  if (!/[A-Za-z]/.test(v)) return "영문자를 포함해야 합니다.";
  if (!/\d/.test(v)) return "숫자를 포함해야 합니다.";
  if (/(.)\1{5,}/.test(v)) return "같은 문자가 너무 반복됩니다.";
  return "";
});

const password2Error = computed(() => {
  const v = form.password2;
  if (!v) return "";
  if (v !== form.password) return "비밀번호가 일치하지 않습니다.";
  return "";
});

// --- Strength meter ---
// Min server-accepted password is 8 chars; the meter rewards anything
// beyond that floor (length, casing, symbol diversity).
const passwordStrength = computed(() => {
  const v = form.password || "";
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 16) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
  const labels = ["매우 약함", "약함", "보통", "좋음", "강함"];
  const colors = ["error", "error", "warning", "info", "success"];
  return { score, label: labels[score], color: colors[score] };
});

// Turnstile removed from signup. Rate-limit (10/10min/IP) on the backend
// plus the upcoming email-verification flow (account inert until verified)
// carry the bot-protection load now. Less friction, same effective floor.

// canFinish gates the submit button on EVERYTHING: filled, valid format,
// matching, strong enough, and Turnstile passed. The submit button is also
// guarded by an explicit formRef.validate() call inside finishSignup.
const canFinish = computed(() => {
  if (submitting.value) return false;
  if (!form.name || !form.email || !form.password || !form.password2) return false;
  if (form.password !== form.password2) return false;
  if (!EMAIL_RE.test(form.email)) return false;
  if (form.password.length < 8 || form.password.length > 128) return false;
  if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return false;
  if (/(.)\1{5,}/.test(form.password)) return false;
  return formValid.value !== false; // null on initial mount counts as ok
});

async function finishSignup() {
  submitError.value = "";

  // Run Vuetify's per-field validation one more time so error chips appear
  // even if the user found a way to click the button (e.g. via keyboard).
  if (formRef.value?.validate) {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  submitting.value = true;
  try {
    // Single call. The backend creates the account, mints session cookies
    // inline, and returns the user record. No separate auto-login round-trip
    // (which would need a Turnstile token we don't collect here).
    // Body is either {id, email, name, role, emailVerified} on a brand-new
    // account, or {message: "OK"} on duplicate-email (we don't tell which —
    // enumeration mitigation).
    const res = await signupApi(form.name, form.email, form.password);

    // Backend creates the inert account and sends the 6-digit code. Response
    // tells us when the code expires so we can show a countdown in step 3.
    verifyEmailLocked.value = res.data?.email || form.email.trim().toLowerCase();
    if (res.data?.verificationExpiresAt) {
      verifyExpiresAt.value = new Date(res.data.verificationExpiresAt).getTime();
    } else {
      verifyExpiresAt.value = Date.now() + 10 * 60 * 1000;
    }
    // NOTE: do NOT markSubmitted here. Account exists but isn't verified —
    // the leave guard should keep warning until step 4 so the user doesn't
    // accidentally close the tab mid-verification.
    step.value = 3; // → 이메일 인증
  } catch (e) {
    console.error(e);
    // 409 = duplicate email — server has an explicit message for this.
    // We stay on step 2 so the user can fix the address or go log in.
    submitError.value =
      e?.response?.data?.message ||
      (e?.response?.status === 409
        ? "이미 가입된 이메일입니다. 로그인을 시도해주세요."
        : "회원가입 실패. 입력 내용을 확인하고 다시 시도해주세요.");
  } finally {
    submitting.value = false;
  }
}

// ---------------- STEP 3 — Email verification ----------------
const verifyEmailLocked = ref(""); // email we're trying to verify; locked once step 3 opens
const verifyExpiresAt = ref(0);    // ms-epoch when the code expires
const digits = ref(["", "", "", "", "", ""]);
const inputs = ref([]);
const verifying = ref(false);
const verifyError = ref("");
const resendingCode = ref(false);
const resendCooldownLeft = ref(0);
let resendTimer = null;
const now = ref(Date.now());
let nowTimer = null;
onMounted(() => { nowTimer = setInterval(() => (now.value = Date.now()), 1000); });
onUnmounted(() => {
  clearInterval(nowTimer);
  clearInterval(resendTimer);
});

const codeRemaining = computed(() => Math.max(0, Math.floor((verifyExpiresAt.value - now.value) / 1000)));
const codeRemainingPretty = computed(() => {
  const s = codeRemaining.value;
  return `${Math.floor(s / 60)}분 ${String(s % 60).padStart(2, "0")}초`;
});
const fullCode = computed(() => digits.value.join(""));
const canSubmitCode = computed(() =>
  /^\d{6}$/.test(fullCode.value) && !verifying.value && codeRemaining.value > 0
);

function onCodeInput(idx, e) {
  const v = e.target.value.replace(/\D/g, "").slice(-1);
  digits.value[idx] = v;
  verifyError.value = "";
  if (v && idx < 5) inputs.value[idx + 1]?.focus();
  if (fullCode.value.length === 6) submitCode();
}
function onCodeKeydown(idx, e) {
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
  inputs.value[Math.min(text.length, 5)]?.focus();
  if (text.length === 6) submitCode();
}

async function submitCode() {
  if (!canSubmitCode.value) return;
  verifying.value = true;
  verifyError.value = "";
  try {
    const { data } = await verifyEmailApi(verifyEmailLocked.value, fullCode.value);
    if (data?.ok) {
      if (data.user) auth.setAuth({ user: data.user });
      open(data?.message || "이메일 인증 완료!", "success");
      // Whole signup flow is done — disarm the leave-guard so the user
      // can navigate freely from step 4.
      markSubmitted();
      step.value = 4; // → 완료
    } else {
      verifyError.value = data?.message || "인증에 실패했습니다.";
      digits.value = ["", "", "", "", "", ""];
      await nextTick();
      inputs.value[0]?.focus();
    }
  } catch (err) {
    verifyError.value =
      err?.response?.data?.message ||
      (err?.response?.status === 429
        ? "잘못된 시도가 너무 많습니다. 새 인증 코드를 요청해주세요."
        : "인증에 실패했습니다.");
    digits.value = ["", "", "", "", "", ""];
    await nextTick();
    inputs.value[0]?.focus();
  } finally {
    verifying.value = false;
  }
}

function startResendCooldown() {
  resendCooldownLeft.value = 60;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCooldownLeft.value = Math.max(0, resendCooldownLeft.value - 1);
    if (resendCooldownLeft.value === 0) clearInterval(resendTimer);
  }, 1000);
}

async function resendCode() {
  if (resendingCode.value || resendCooldownLeft.value > 0) return;
  resendingCode.value = true;
  try {
    const { data } = await resendVerificationApi(verifyEmailLocked.value);
    if (data?.verificationExpiresAt) {
      verifyExpiresAt.value = new Date(data.verificationExpiresAt).getTime();
    } else {
      verifyExpiresAt.value = Date.now() + 10 * 60 * 1000;
    }
    open("새 인증 코드를 보냈습니다.", "success");
    digits.value = ["", "", "", "", "", ""];
    verifyError.value = "";
    startResendCooldown();
    await nextTick();
    inputs.value[0]?.focus();
  } catch (err) {
    open(
      err?.response?.status === 429
        ? "잠시 후 다시 시도해주세요."
        : "메일 발송에 실패했습니다.",
      "error"
    );
    startResendCooldown();
  } finally {
    resendingCode.value = false;
  }
}

// When the user lands on step 3 fresh, focus the first cell.
watch(step, async (s) => {
  if (s === 3) {
    await nextTick();
    inputs.value[0]?.focus();
  }
});
</script>

<style scoped>
/* Stacked label so it stays above the field even when empty — avoids
   Vuetify's floating-label-collapses-into-the-box look that pairs
   poorly with the inline error chip. */
.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
/* Constrain the verification-step contents so the buttons don't stretch
   the whole stepper width on desktop — looks like a billboard otherwise. */
.verify-step {
  max-width: 420px;
  margin: 0 auto;
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
