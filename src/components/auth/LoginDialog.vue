<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card rounded="xl" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- STEP 1 — enter email -->
      <div v-if="step === 'email'">
        <h2 class="text-h6 mb-1">로그인</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">계정 이메일을 입력하세요.</p>
        <v-text-field
          v-model="email"
          label="이메일"
          type="email"
          variant="outlined"
          density="comfortable"
          name="email"
          autocomplete="username webauthn"
          autofocus
          @keyup.enter="goNext"
        />

        <!-- Turnstile (still required to fight credential-stuffing) -->
        <div class="ts-label">Let us know you are human</div>
        <div class="ts-frame">
          <div ref="turnstileBox" style="min-height: 65px" />
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>

        <v-btn
          block color="primary" size="large" class="mt-2"
          :disabled="!email || !turnstileToken"
          @click="goNext"
        >
          다음
        </v-btn>
      </div>

      <!-- STEP 2 — passkey primary, password fallback -->
      <div v-else-if="step === 'method'">
        <div class="d-flex align-center mb-2">
          <v-btn icon size="small" variant="text" class="mr-1" @click="step = 'email'">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2 class="text-h6">{{ email }}</h2>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-4">로그인 방법을 선택하세요.</p>

        <v-btn
          block color="primary" size="large" class="mb-3"
          prepend-icon="mdi-key-variant"
          :loading="pkLoading"
          @click="passkeyLogin"
        >
          Passkey로 로그인
        </v-btn>

        <div class="text-center my-2 text-body-2">
          <a class="text-primary cursor-pointer" @click="step = 'password'">
            비밀번호로 로그인
          </a>
        </div>
      </div>

      <!-- STEP 3 — password fallback -->
      <div v-else-if="step === 'password'">
        <div class="d-flex align-center mb-2">
          <v-btn icon size="small" variant="text" class="mr-1" @click="step = 'method'">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2 class="text-h6">{{ email }}</h2>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-4">비밀번호를 입력하세요.</p>

        <v-text-field
          v-model="password"
          label="비밀번호"
          type="password"
          variant="outlined"
          density="comfortable"
          name="password"
          autocomplete="current-password"
          autofocus
          @keyup.enter="login"
        />

        <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>

        <v-btn
          block color="primary" size="large" class="mt-2"
          :loading="loading"
          @click="login"
        >
          로그인
        </v-btn>
      </div>

      <v-divider class="my-4">또는</v-divider>

      <div class="text-center mb-3">
        계정이 없으신가요?
        <span class="text-primary cursor-pointer" @click="goSignup">회원가입</span>
      </div>

      <v-btn block variant="outlined" class="mb-2" prepend-icon="mdi-google" @click="social('google')">
        Google로 로그인
      </v-btn>
      <v-btn block variant="flat" @click="social('kakao')" style="background: #fee500; color: #000">
        <v-icon class="mr-2">mdi-chat</v-icon>
        카카오로 로그인
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { loginApi } from "@/api/auth";
import { loginStart as pkLoginStart, loginFinish as pkLoginFinish } from "@/api/webauthn";
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

const step = ref("email"); // 'email' | 'method' | 'password'
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const pkLoading = ref(false);

// --- Cloudflare Turnstile (explicit render) ---
const TURNSTILE_SITEKEY = "0x4AAAAAADYJm08LeNJZIsCY";
const turnstileBox = ref(null);
const turnstileToken = ref("");
let turnstileWidgetId = null;
if (typeof window !== "undefined" && !document.getElementById("cf-turnstile-script")) {
  const s = document.createElement("script");
  s.id = "cf-turnstile-script";
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  s.async = true; s.defer = true;
  document.head.appendChild(s);
}
function mountTurnstile() {
  if (!turnstileBox.value) return;
  if (!window.turnstile) { setTimeout(mountTurnstile, 200); return; }
  if (turnstileWidgetId != null) { try { window.turnstile.reset(turnstileWidgetId); } catch (_) {} return; }
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

watch(() => model.value, async (openNow) => {
  if (openNow) {
    step.value = "email";
    email.value = ""; password.value = ""; error.value = "";
    await nextTick();
    mountTurnstile();
    startConditionalPasskey(); // surface passkey via the email autofill chip
  } else {
    unmountTurnstile();
    if (conditionalAbort) { try { conditionalAbort.abort(); } catch (_) {} conditionalAbort = null; }
  }
}, { immediate: true });

function closeDialog() {
  model.value = false;
}

async function goNext() {
  if (!email.value || !turnstileToken.value) return;
  step.value = "method";
}


let conditionalAbort = null;
async function startConditionalPasskey() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return;
  try {
    if (typeof PublicKeyCredential.isConditionalMediationAvailable === "function") {
      const supported = await PublicKeyCredential.isConditionalMediationAvailable();
      if (!supported) return;
    } else {
      return;
    }
    const { data: opts } = await pkLoginStart();
    conditionalAbort = new AbortController();
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
    // This sits in the background — resolves only when the user picks
    // the passkey from the email field's autofill chip.
    const assertion = await navigator.credentials.get({
      publicKey,
      mediation: "conditional",
      signal: conditionalAbort.signal,
    });
    if (!assertion) return;
    const credentialId = bufToB64Url(assertion.rawId);
    const { data: user } = await pkLoginFinish({ credentialId, challenge: opts.challenge });
    auth.setAuth({ user });
    open("Passkey 로그인 성공!", "success");
    model.value = false;
    emit("success");
    try {
      const rname = router.currentRoute.value?.name;
      if (!rname || rname === "notFound") router.push("/");
    } catch (_) {}
  } catch (e) {
    // Most common: AbortError when the dialog closes — silently ignore.
    if (e?.name !== "AbortError") console.warn("conditional passkey:", e);
  }
}

async function passkeyLogin() {
  if (pkLoading.value) return;
  pkLoading.value = true;
  error.value = "";
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
    const credentialId = bufToB64Url(assertion.rawId);
    const { data: user } = await pkLoginFinish({ credentialId, challenge: opts.challenge });
    auth.setAuth({ user });
    open("Passkey 로그인 성공!", "success");
    model.value = false;
    emit("success");
    try {
      const rname = router.currentRoute.value?.name;
      if (!rname || rname === "notFound") router.push("/");
    } catch (_) {}
  } catch (e) {
    console.error(e);
    error.value = e?.message?.includes("canceled") ? "취소되었습니다." : "Passkey 로그인 실패";
  } finally {
    pkLoading.value = false;
  }
}

async function login() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    const { data: user } = await loginApi(email.value, password.value, turnstileToken.value);
    auth.setAuth({ user });
    open("로그인 되었습니다.", "success");
    model.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.message || "로그인 실패";
  } finally {
    loading.value = false;
  }
}

function goSignup() {
  model.value = false;
  emit("go-signup");
}

function social(provider) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  window.location.href = `${base}/oauth2/authorization/${provider}`;
}
</script>

<style scoped>
.ts-label {
  margin: 6px 0;
  color: #4b5563;
  font-size: 14px;
}
.ts-frame {
  background: #f7f8fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 16px;
}
.cursor-pointer { cursor: pointer; }
</style>
