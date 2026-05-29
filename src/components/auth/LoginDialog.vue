<template>
  <v-dialog v-model="model" max-width="420">
    <v-card rounded="xl" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <v-btn icon variant="text" @click="model = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-text-field
        v-model="email"
        label="이메일"
        type="email"
        variant="outlined"
        density="comfortable"
        class="mb-2"
      />

      <v-text-field
        v-model="password"
        label="비밀번호"
        type="password"
        variant="outlined"
        density="comfortable"
        class="mb-2"
        @keyup.enter="login"
      />

      <!-- Cloudflare Turnstile — explicit render so it survives dialog mount/unmount -->
      <div class="ts-label">Let us know you are human</div>
      <div class="ts-frame">
        <div ref="turnstileBox" style="min-height: 65px" />
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-3">
        {{ error }}
      </v-alert>
      <v-btn
        block
        color="primary"
        size="large"
        class="mt-2"
        :loading="loading"
        :disabled="!turnstileToken"
        @click="login"
      >
        로그인
      </v-btn>

      <v-btn
        block
        variant="outlined"
        size="large"
        class="mt-2"
        prepend-icon="mdi-key-variant"
        :loading="pkLoading"
        @click="passkeyLogin"
      >
        Passkey로 로그인
      </v-btn>

      <v-divider class="my-4">또는</v-divider>

      <div class="text-center mt-4">
        계정이 없으신가요?
        <span class="text-primary cursor-pointer" @click="goSignup">
          회원가입
        </span>
      </div>

      <v-btn
        block
        variant="outlined"
        class="mb-3"
        prepend-icon="mdi-google"
        @click="social('google')"
      >
        Google로 로그인
      </v-btn>

      <v-btn
        block
        class="mb-4"
        variant="flat"
        @click="social('kakao')"
        style="background: #fee500; color: #000"
      >
        <v-icon class="mr-2">mdi-chat</v-icon>
        카카오로 로그인
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { loginApi } from "@/api/auth";
import { loginStart as pkLoginStart, loginFinish as pkLoginFinish } from "@/api/webauthn";
import { bufToB64Url, b64UrlToBuf } from "@/lib/webauthn";

const pkLoading = ref(false);
async function passkeyLogin() {
  if (pkLoading.value) return;
  pkLoading.value = true;
  try {
    const { data: opts } = await pkLoginStart();
    // Browser expects ArrayBuffer for challenge
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
    const { data: user } = await pkLoginFinish({
      credentialId,
      challenge: opts.challenge,
    });
    auth.setAuth({ user });
    open("Passkey 로그인 성공!", "success");
    model.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    open(e?.message?.includes("canceled") ? "취소되었습니다." : "Passkey 로그인 실패", "error");
  } finally {
    pkLoading.value = false;
  }
}

import { nextTick } from "vue";

// --- Cloudflare Turnstile (explicit render API) ---
// The auto-render mode (class="cf-turnstile") scans the DOM once at script
// load. Our widget lives inside <v-dialog>, which mounts later — so we have
// to drive render() ourselves whenever the dialog opens.
const TURNSTILE_SITEKEY = "0x4AAAAAADYJm08LeNJZIsCY";
const turnstileBox = ref(null);
const turnstileToken = ref("");
let turnstileWidgetId = null;

if (typeof window !== "undefined" && !document.getElementById("cf-turnstile-script")) {
  const __s = document.createElement("script");
  __s.id = "cf-turnstile-script";
  __s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  __s.async = true; __s.defer = true;
  document.head.appendChild(__s);
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

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "success", "go-signup"]);

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// Reset form when dialog opens
watch(() => props.modelValue, (open) => {
  if (open) {
    email.value = "";
    password.value = "";
    error.value = "";
  }
});

const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function login() {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Please enter email and password.";
    return;
  }

  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters.";
    return;
  }

  loading.value = true;
  try {
    const { data } = await loginApi(email.value, password.value, turnstileToken.value);

    // Cookie auth: login sets the access_token cookie server-side and returns
    // the user record directly (no token in body).
    auth.setAuth({ user: data });

    emit("success", data);
    model.value = false;
  } catch (e) {
    error.value =
      e?.response?.data?.message || "Login failed. Check your credentials.";
  } finally {
    loading.value = false;
  }
}

function social(provider) {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/${provider}`;
}

function goSignup() {
  emit("go-signup");
  model.value = false;
}


// Mount the widget when the dialog opens, tear it down when it closes.
import { watch as __cfWatch } from "vue";
__cfWatch(
  () => model.value,
  async (open) => {
    if (open) {
      await nextTick();
      mountTurnstile();
    } else {
      unmountTurnstile();
    }
  },
  { immediate: true },
);
</script>

<style scoped>

.ts-label {
  margin-top: 6px;
  margin-bottom: 6px;
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
</style>
