<template>
  <v-dialog v-model="model" max-width="460" persistent>
    <v-card rounded="xl" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <h2 class="text-h6 mb-4">로그인</h2>

      <label class="field-label">이메일</label>
      <v-text-field
        v-model="email"
        placeholder="you@example.com"
        type="email"
        variant="outlined"
        density="comfortable"
        name="email"
        autocomplete="username"
        autofocus
        class="mb-3"
        :error-messages="emailFieldError"
        :error="!!emailFieldError"
        hide-details="auto"
        @keyup.enter="passwordLogin"
      />

      <label class="field-label">비밀번호</label>
      <v-text-field
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="비밀번호 입력"
        variant="outlined"
        density="comfortable"
        name="password"
        autocomplete="current-password"
        class="mb-3"
        hide-details="auto"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        @keyup.enter="passwordLogin"
      />

      <!-- Turnstile (required for password login — passkey doesn't need it) -->
      <div class="ts-frame mb-2">
        <div ref="turnstileBox" style="min-height: 65px" />
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>

      <v-btn
        block color="primary" size="large" class="mb-2"
        prepend-icon="mdi-login"
        :loading="passwordLoading"
        :disabled="!canPasswordLogin"
        @click="passwordLogin"
      >
        비밀번호로 로그인
      </v-btn>

      <v-btn
        block color="secondary" variant="tonal" size="large" class="mb-3"
        prepend-icon="mdi-key-variant"
        :loading="pkLoading || checkingEmail"
        :disabled="!isEmailValid || pkLoading || checkingEmail"
        @click="passkeyLogin"
      >
        Passkey로 로그인
      </v-btn>

      <v-divider class="my-3">또는</v-divider>

      <v-btn block variant="outlined" class="mb-2" prepend-icon="mdi-google" @click="social('google')">
        Google로 로그인
      </v-btn>
      <v-btn block variant="flat" class="mb-3" @click="social('kakao')" style="background: #fee500; color: #000">
        <v-icon class="mr-2">mdi-chat</v-icon>
        카카오로 로그인
      </v-btn>

      <div class="text-center mt-2 text-body-2">
        계정이 없으신가요?
        <a
          href="#"
          role="button"
          class="text-primary link-tap"
          @click.prevent="goSignup"
          @touchend.prevent="goSignup"
        >회원가입</a>
      </div>
      <div class="text-center mt-1 text-body-2">
        <a
          href="#"
          role="button"
          class="text-primary link-tap"
          @click.prevent="goForgotPassword"
          @touchend.prevent="goForgotPassword"
        >비밀번호를 잊으셨나요?</a>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { loginStart as pkLoginStart, loginFinish as pkLoginFinish } from "@/api/webauthn";
import { emailExistsApi, loginApi } from "@/api/auth";
import { bufToB64Url, b64UrlToBuf } from "@/lib/webauthn";
import { useAlert } from "@/composables/useAlert";

const router = useRouter();
const auth = useAuthStore();
const { open } = useAlert();
const emit = defineEmits(["success", "go-signup", "update:modelValue"]);
const props = defineProps({ modelValue: Boolean });

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const pkLoading = ref(false);
const passwordLoading = ref(false);
const checkingEmail = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmailValid = computed(() => EMAIL_RE.test(email.value || ""));
const emailFieldError = computed(() => {
  const v = email.value;
  if (!v) return "";
  if (!EMAIL_RE.test(v)) return "유효한 이메일을 입력해주세요.";
  return "";
});

// Password login is the brute-forceable path, so it gets Turnstile + email + password gates.
// Passkey is unbruteforceable, so it skips Turnstile.
// Google/Kakao redirect away to provider OAuth, no local gates.
const canPasswordLogin = computed(() =>
  !passwordLoading.value
  && isEmailValid.value
  && !!password.value
  && !!turnstileToken.value
);

// ---------------- Cloudflare Turnstile (explicit render) ----------------
const TURNSTILE_SITEKEY = "0x4AAAAAADYJm08LeNJZIsCY";
const turnstileBox = ref(null);
const turnstileToken = ref("");
let turnstileWidgetId = null;

function ensureTurnstileScript() {
  if (typeof window === "undefined") return;
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

async function passwordLogin() {
  if (passwordLoading.value) return;
  if (!isEmailValid.value) { error.value = "유효한 이메일을 입력해주세요."; return; }
  if (!password.value) { error.value = "비밀번호를 입력해주세요."; return; }
  if (!turnstileToken.value) { error.value = "사람 확인을 완료해주세요."; return; }
  error.value = "";
  passwordLoading.value = true;
  try {
    const { data } = await loginApi(email.value.trim(), password.value, turnstileToken.value);
    auth.setAuth({ user: data });
    open("로그인 되었습니다.", "success");
    model.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    // Credentials correct but email unverified → backend has already sent a
    // fresh code; route the user to /verify-pending with the email prefilled.
    if (e?.response?.status === 403 && e?.response?.data?.code === "EMAIL_NOT_VERIFIED") {
      open("이메일 인증이 필요합니다. 새 인증 코드를 보냈습니다.", "warning");
      model.value = false;
      router.push({ name: "verifyPending", query: { email: email.value.trim() } });
      return;
    }
    error.value =
      e?.response?.data?.message ||
      (e?.response?.status === 401
        ? "이메일 또는 비밀번호가 올바르지 않습니다."
        : "로그인 실패. 잠시 후 다시 시도해주세요.");
    // Single-use Turnstile token — reset on failure
    if (window.turnstile && turnstileWidgetId != null) {
      try { window.turnstile.reset(turnstileWidgetId); } catch (_) {}
    }
    turnstileToken.value = "";
  } finally {
    passwordLoading.value = false;
  }
}

async function completePasskey(assertion, challenge) {
  const r = assertion.response;
  const { data: user } = await pkLoginFinish({
    credentialId: bufToB64Url(assertion.rawId),
    authenticatorData: bufToB64Url(r.authenticatorData),
    clientDataJSON:   bufToB64Url(r.clientDataJSON),
    signature:        bufToB64Url(r.signature),
    challenge,
  });
  auth.setAuth({ user });
  open("Passkey 로그인 성공!", "success");
  model.value = false;
  emit("success");
  try {
    const rname = router.currentRoute.value?.name;
    if (!rname || rname === "notFound") router.push("/");
  } catch (_) {}
}

async function passkeyLogin() {
  if (pkLoading.value || checkingEmail.value) return;
  if (!isEmailValid.value) { error.value = "유효한 이메일을 입력해주세요."; return; }
  error.value = "";

  checkingEmail.value = true;
  try {
    const { data } = await emailExistsApi(email.value.trim());
    if (!data?.exists) {
      error.value = "계정을 찾을 수 없습니다. 이메일을 확인하거나 회원가입을 진행해주세요.";
      return;
    }
  } catch (e) {
    console.error(e);
    error.value = e?.response?.status === 429
      ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
      : "로그인 확인 실패. 잠시 후 다시 시도해주세요.";
    return;
  } finally {
    checkingEmail.value = false;
  }

  pkLoading.value = true;
  try {
    const { data: opts } = await pkLoginStart();
    const publicKey = {
      challenge: b64UrlToBuf(opts.challenge),
      rpId: opts.rpId,
      userVerification: opts.userVerification || "preferred",
      timeout: opts.timeout || 60000,
      allowCredentials: (opts.allowCredentials || []).map((c) => ({
        type: "public-key",
        id: b64UrlToBuf(c.id),
      })),
    };
    const assertion = await navigator.credentials.get({ publicKey });
    if (!assertion) throw new Error("Passkey canceled");
    await completePasskey(assertion, opts.challenge);
  } catch (e) {
    console.error(e);
    error.value = e?.message?.includes("canceled") ? "취소되었습니다." : "Passkey 로그인 실패";
  } finally {
    pkLoading.value = false;
  }
}

function closeDialog()  { model.value = false; }
function goSignup()     { model.value = false; emit("go-signup"); }
function goForgotPassword() {
  model.value = false;
  router.push({ name: "forgotPassword" });
}
function social(provider) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  window.location.href = `${base}/oauth2/authorization/${provider}`;
}

// Reset on open/close, mount/unmount Turnstile
watch(() => model.value, async (openNow) => {
  if (openNow) {
    email.value = ""; password.value = ""; error.value = "";
    ensureTurnstileScript();
    await nextTick();
    mountTurnstile();
  } else {
    unmountTurnstile();
  }
});

onMounted(async () => {
  if (model.value) {
    ensureTurnstileScript();
    await nextTick();
    mountTurnstile();
  }
});
onUnmounted(unmountTurnstile);
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
/* Mobile tap target: <span @click> wasn't reliably hitting on iOS/Android
 * inside a v-dialog. <a role=button> + a real tap surface fixes it. */
.link-tap {
  display: inline-block;
  padding: 8px 4px;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;          /* kill 300ms tap delay + double-tap zoom */
  -webkit-tap-highlight-color: rgba(25,118,210,0.18);
}
.link-tap:hover,
.link-tap:active { text-decoration: underline; }
</style>
