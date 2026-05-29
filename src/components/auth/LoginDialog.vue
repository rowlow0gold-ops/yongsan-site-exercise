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
        :error-messages="emailFieldError"
        :error="!!emailFieldError"
        validate-on="input lazy"
        required
        @keyup.enter="passkeyLogin"
      />

      <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>

      <v-btn
        block color="primary" size="large" class="mb-3"
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
        <span class="text-primary cursor-pointer" @click="goSignup">회원가입</span>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { loginStart as pkLoginStart, loginFinish as pkLoginFinish } from "@/api/webauthn";
import { emailExistsApi } from "@/api/auth";
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
const checkingEmail = ref(false);

// Microsoft-style: identifier required before any sign-in method can be
// used. We probe /auth/email-exists on click so the user gets a
// "no such account" up front instead of silently signing in to whoever
// owns the passkey the browser offers.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmailValid = computed(() => EMAIL_RE.test(email.value || ""));
const emailRules = [
  (v) => !!v || "이메일을 입력해주세요.",
  (v) => EMAIL_RE.test(v || "") || "유효한 이메일을 입력해주세요.",
];
// Bulletproof explicit error display — bypasses Vuetify's touched-state
// quirks so the error chip shows the moment the value is invalid.
const emailFieldError = computed(() => {
  const v = email.value;
  if (!v) return "";
  if (!EMAIL_RE.test(v)) return "유효한 이메일을 입력해주세요.";
  return "";
});

// NOTE: Turnstile was removed from this dialog. It existed as a brute-force
// shield for password login; with password gone and only passkey + OAuth
// remaining (both bot-resistant by design), it was just user friction.
//
// WebAuthn Conditional UI was also removed — see git history. It auto-fires
// the OS passkey sheet on dialog open, bypassing the email-required gate.

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
  if (pkLoading.value || checkingEmail.value) return;
  if (!isEmailValid.value) {
    error.value = "유효한 이메일을 입력해주세요.";
    return;
  }
  error.value = "";

  // Step 1: probe the server to see if this email is a registered account.
  // Until this returns true, we don't even consider calling WebAuthn —
  // that prevents the silent identity-swap where any passkey on the device
  // could log the user in regardless of the email they typed.
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

  // Step 2: kick off WebAuthn. (Backend still uses the discoverable-credential
  // flow — narrowing allowCredentials by email is task #51's follow-up.)
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
function social(provider) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  window.location.href = `${base}/oauth2/authorization/${provider}`;
}

// Reset on open/close
watch(() => model.value, (openNow) => {
  if (openNow) { email.value = ""; error.value = ""; }
});
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
