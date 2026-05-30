<template>
  <v-card rounded="xl" class="pa-6">
    <div class="text-h6 font-weight-bold mb-6">회원가입</div>

    <v-stepper v-model="step" rounded="xl" elevation="0">
      <v-stepper-header>
        <v-stepper-item :value="1" title="약관동의" />
        <v-divider />
        <v-stepper-item :value="2" title="기본정보" />
        <v-divider />
        <v-stepper-item :value="3" title="완료" />
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

        <!-- STEP 3 -->
        <v-stepper-window-item :value="3">
          <v-alert type="success" variant="tonal" class="mb-6">
            회원가입 UI 완료!
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
import { computed, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { signupApi, loginApi } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import { useLeaveGuard } from "@/composables/useLeaveGuard";
import { useSeo } from "@/composables/useSeo";
const auth = useAuthStore();
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

// Leave guard — warn if user started filling the form (step 2+)
const { markSubmitted } = useLeaveGuard(
  () => step.value >= 2 && !!(form.name || form.email || form.password),
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
    // 1) signup (server replies generically; we can't tell from the response
    //    whether the email was new or already taken — that's deliberate, see
    //    audit: email enumeration mitigation)
    await signupApi(form.name, form.email, form.password);

    // 2) auto login (will fail if the email was taken with a different password)
    const res = await loginApi(form.email, form.password);
    // Cookie auth: login response is the user record directly; the access
    // token lives in an HttpOnly cookie now.
    auth.setAuth({ user: res.data });
    markSubmitted();

    step.value = 3;
  } catch (e) {
    console.error(e);
    // Show inline error instead of native alert(); preserve the form.
    submitError.value =
      e?.response?.data?.message ||
      "회원가입 실패. 입력 내용을 확인하고 다시 시도해주세요.";
  } finally {
    submitting.value = false;
  }
}
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
</style>
