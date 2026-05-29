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

      <!-- Cloudflare Turnstile -->
      <div
        class="cf-turnstile mb-2"
        data-sitekey="0x4AAAAAADYJm08LeNJZIsCY"
        data-callback="onLoginTurnstileSuccess"
        data-error-callback="onLoginTurnstileError"
        data-expired-callback="onLoginTurnstileExpired"
      />

      <v-alert v-if="error" type="error" variant="tonal" class="mb-3">
        {{ error }}
      </v-alert>
      <v-btn
        block
        color="primary"
        size="large"
        class="mt-2"
        :loading="loading"
        @click="login"
      >
        로그인
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

// --- Cloudflare Turnstile ---
const turnstileToken = ref("");
function onLoginTurnstileSuccess(t) { turnstileToken.value = t || ""; }
function onLoginTurnstileError()    { turnstileToken.value = ""; }
function onLoginTurnstileExpired()  { turnstileToken.value = ""; }
if (typeof window !== "undefined") {
  window.onLoginTurnstileSuccess = onLoginTurnstileSuccess;
  window.onLoginTurnstileError   = onLoginTurnstileError;
  window.onLoginTurnstileExpired = onLoginTurnstileExpired;
  if (!document.getElementById("cf-turnstile-script")) {
    const __s = document.createElement("script");
    __s.id = "cf-turnstile-script";
    __s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    __s.async = true; __s.defer = true;
    document.head.appendChild(__s);
  }
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
</script>
