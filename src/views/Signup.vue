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
          <v-checkbox v-model="agreePrivacy" label="개인정보 처리방침 동의 (필수)" />
          <v-checkbox v-model="agreeMarketing" label="마케팅 수신 동의 (선택)" />

          <div class="d-flex justify-end mt-6">
            <v-btn color="primary" :disabled="!canGoStep2" @click="step = 2">
              다음
            </v-btn>
          </div>
        </v-stepper-window-item>

        <!-- STEP 2 -->
        <v-stepper-window-item :value="2">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="이름" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="이메일" type="email" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.password" label="비밀번호" type="password" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.password2" label="비밀번호 확인" type="password" variant="outlined" />
            </v-col>
          </v-row>

          <v-alert
            v-if="form.password && form.password2 && form.password !== form.password2"
            type="warning"
            variant="tonal"
            class="mt-2"
          >
            비밀번호가 일치하지 않습니다.
          </v-alert>

          <div class="d-flex justify-space-between mt-6">
            <v-btn variant="outlined" @click="step = 1">이전</v-btn>
            <v-btn color="primary" :disabled="!canFinish" @click="finishSignup">
              완료
            </v-btn>
          </div>
        </v-stepper-window-item>

        <!-- STEP 3 -->
        <v-stepper-window-item :value="3">
          <v-alert type="success" variant="tonal" class="mb-6">
            회원가입 UI 완료! (백엔드 연결은 나중에)
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
import { computed, reactive, ref, watch } from "vue"
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const route = useRoute()

// ✅ step sync with left sidebar via query (?step=1/2/3)
const step = ref(Number(route.query.step || 1))

watch(step, (v) => {
  router.replace({ query: { ...route.query, step: String(v) } })
})

const agreeAll = ref(false)
const agreeTerms = ref(false)
const agreePrivacy = ref(false)
const agreeMarketing = ref(false)

watch(agreeAll, (v) => {
  agreeTerms.value = v
  agreePrivacy.value = v
  agreeMarketing.value = v
})

const canGoStep2 = computed(() => agreeTerms.value && agreePrivacy.value)

const form = reactive({
  name: "",
  email: "",
  password: "",
  password2: "",
})

const canFinish = computed(() => {
  if (!form.name || !form.email || !form.password || !form.password2) return false
  return form.password === form.password2
})

function finishSignup() {
  // UI-only: later replace with axios call
  localStorage.setItem("signup_preview", JSON.stringify({ ...form }))
  step.value = 3
}
</script>