<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card rounded="xl" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <h2 class="text-h6 mb-4">로그인</h2>

      <v-text-field
        v-model="email"
        label="이메일"
        type="email"
        variant="outlined"
        density="comfortable"
        name="email"
        autocomplete="username"
        autofocus
        class="mb-2"
        :rules="emailRules"
        validate-on="input lazy"
        required
      />

      <!-- Turnstile -->
      <div class="ts-label">Let us know you are human</div>
      <div class="ts-frame">
        <div ref="turnstileBox" style="min-height: 65px" />
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>

      <v-btn
        block color="primary" size="large" class="mb-3"
        prepend-icon="mdi-key-variant"
        :loading="pkLoading"
        :disabled="!turnstileToken || !isEmailValid"
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
        <span class="text-primary cursor-pointer" @click="goSignup">회원가입</span>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
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

const email = ref("");
const error = ref("");
const pkLoading = ref(false);
const turnstileBox = ref(null);
const turnstileToken = ref("");

// Microsoft-style: identifier required before any sign-in method can be
// used. The email is sent to the server as part of WebAuthn loginStart
// so we can narrow allowCredentials to that user's passkeys (also lets
// us reject 'unknown account' early instead of generic credential
// rejection later).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmailValid = computed(() => EMAIL_RE.test(email.value || ""));
const emailRules = [
  (v) => !!v || "이메일을 입력해주세요.",
  (v) => EMAIL_RE.test(v || "") || "유효한 이메일을 입력해주세요.",
];

// --- Cloudflare Turnstile (explicit render) ---
const TURNSTILE_SITEKEY = "0x4AAAAAADYJm08LeNJZIsCY";
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

// NOTE: WebAuthn Conditional UI was removed deliberately.
// It auto-fires navigator.credentials.get({mediation: "conditional"}) which
// causes the OS to show the saved-passkey sheet without the user ever
// typing an email. That bypasses the email-required gate on the Passkey
// button. Microsoft-style enforcement: passkey auth only fires from the
// explicit gated button below, never on dialog open.

async function completePasskey(assertion, challenge) {
  const credentialId = bufToB64Url(assertion.rawId);
  const { data: user } = await pkLoginFinish({ credentialId, challenge });
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
  if (pkLoading.value) return;
  // Hard re-check the email gate — defense in depth against a button that
  // somehow becomes clickable while the email is empty/invalid (devtools,
  // accessibility tools, etc).
  if (!isEmailValid.value) {
    error.value = "유효한 이메일을 입력해주세요.";
    return;
  }
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
function social(provider) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  window.location.href = `${base}/oauth2/authorization/${provider}`;
}

// React to open/close. NOT immediate — avoids TDZ on the functions below.
watch(() => model.value, async (openNow) => {
  if (openNow) {
    email.value = ""; error.value = "";
    ensureTurnstileScript();
    await nextTick();
    mountTurnstile();
    // Conditional UI deliberately not started — see note above.
  } else {
    unmountTurnstile();
  }
});

// If the dialog is already open at mount time (e.g. URL ?login=1 path),
// kick the same flow once. By now all functions are defined.
onMounted(async () => {
  if (model.value) {
    ensureTurnstileScript();
    await nextTick();
    mountTurnstile();
  }
});

onUnmounted(() => {
  unmountTurnstile();
});
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
  margin-bottom: 12px;
}
.cursor-pointer { cursor: pointer; }
</style>
