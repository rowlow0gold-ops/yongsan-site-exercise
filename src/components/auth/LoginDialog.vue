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
import { computed, ref } from "vue";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { loginApi } from "@/api/auth";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "success", "go-signup"]);

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
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
    const { data } = await loginApi(email.value, password.value);

    // Expecting backend response:
    // { accessToken: "...", user: {...} }

    auth.setAuth({
      accessToken: data.accessToken,
      user: data.user,
    });

    emit("success", data.user);
    model.value = false;
  } catch (e) {
    error.value =
      e?.response?.data?.message || "Login failed. Check your credentials.";
  } finally {
    loading.value = false;
  }
}

function social(provider) {
  window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
}

function goSignup() {
  emit("go-signup");
  model.value = false;
}
</script>
