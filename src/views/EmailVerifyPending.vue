<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { resendVerificationApi, meApi } from "@/api/auth";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "이메일 인증 필요", description: "이메일 인증을 완료해주세요.", path: "/verify-pending" });

const auth = useAuthStore();
const router = useRouter();
const { open } = useAlert();

const sending = ref(false);
const refreshing = ref(false);

async function resend() {
  if (sending.value) return;
  sending.value = true;
  try {
    const { data } = await resendVerificationApi();
    open(data?.message || "인증 메일을 다시 보냈습니다.", "success");
  } catch (e) {
    open(
      e?.response?.status === 429
        ? "잠시 후 다시 시도해주세요."
        : "메일 발송에 실패했습니다.",
      "error"
    );
  } finally {
    sending.value = false;
  }
}

async function refresh() {
  if (refreshing.value) return;
  refreshing.value = true;
  try {
    const { data } = await meApi();
    auth.setUser(data);
    if (data?.emailVerified) {
      open("인증이 확인되었습니다!", "success");
      router.push("/");
    } else {
      open("아직 인증되지 않았습니다.", "warning");
    }
  } catch (_) {
    open("확인에 실패했습니다.", "error");
  } finally {
    refreshing.value = false;
  }
}
</script>

<template>
  <div class="verify-pending-page">
    <v-card class="pa-6 text-center" rounded="xl" max-width="520" width="100%">
    <v-icon size="56" color="primary" class="mb-3">mdi-email-fast-outline</v-icon>
    <h2 class="text-h6 mb-2">이메일 인증을 완료해주세요</h2>
    <p class="text-body-2 text-medium-emphasis mb-2">
      <strong>{{ auth.user?.email || "" }}</strong>로 인증 메일을 보냈습니다.
    </p>
    <p class="text-body-2 text-medium-emphasis mb-5">
      메일의 인증 버튼을 클릭하면 회원 기능을 이용하실 수 있습니다.
      메일이 보이지 않으면 스팸함도 확인해보세요.
    </p>

    <v-btn block color="primary" size="large" class="mb-2" :loading="refreshing" @click="refresh">
      인증 완료 확인
    </v-btn>
    <v-btn block variant="outlined" :loading="sending" @click="resend">
      인증 메일 다시 보내기
    </v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.verify-pending-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
</style>
