<template>
  <v-dialog v-model="model" max-width="420">
    <v-card rounded="xl" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h6 font-weight-bold">로그인</div>
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

      <v-btn block color="primary" size="large" class="mt-2" @click="fakeLogin">
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
        @click="fakeSocial('google')"
      >
        Google로 로그인
      </v-btn>

      <v-btn
        block
        class="mb-4"
        variant="flat"
        @click="fakeSocial('kakao')"
        style="background:#FEE500; color:#000;"
      >
        <v-icon class="mr-2">mdi-chat</v-icon>
        카카오로 로그인
      </v-btn>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue"

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(["update:modelValue", "success", "go-signup"])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
})

const email = ref("")
const password = ref("")

function fakeLogin() {
  localStorage.setItem("token", "normal")
  emit("success")
  model.value = false
}

function fakeSocial(provider) {
  localStorage.setItem("token", provider)
  emit("success")
  model.value = false
}

function goSignup() {
  emit("go-signup") // ✅ parent will route
  model.value = false // ✅ close dialog
}
</script>