<script setup>
import { ref, onMounted } from "vue";
import { meApi } from "@/api/auth";
import {
  registerStart as pkRegStart,
  registerFinish as pkRegFinish,
  listCredentials as pkList,
  revokeCredential as pkRevoke,
} from "@/api/webauthn";
import { bufToB64Url, b64UrlToBuf } from "@/lib/webauthn";
import { useAlert } from "@/composables/useAlert";
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "마이페이지", description: "내 정보 확인", path: "/mypage" });

const { open } = useAlert();

const loading = ref(true);
const user = ref(null);
const error = ref(null);

const credentials = ref([]);
const credLoading = ref(false);
const enrolling = ref(false);
const nicknameInput = ref("");

async function loadCreds() {
  try {
    credLoading.value = true;
    const { data } = await pkList();
    credentials.value = data;
  } catch (_) {
    credentials.value = [];
  } finally {
    credLoading.value = false;
  }
}

onMounted(async () => {
  try {
    const { data } = await meApi();
    user.value = data;
    await loadCreds();
  } catch (e) {
    error.value = "Failed to load user info.";
  } finally {
    loading.value = false;
  }
});

async function enrollPasskey() {
  if (enrolling.value) return;
  if (!("credentials" in navigator) || !window.PublicKeyCredential) {
    open("이 브라우저는 Passkey를 지원하지 않습니다.", "error");
    return;
  }
  enrolling.value = true;
  try {
    const { data: opts } = await pkRegStart();
    const publicKey = {
      challenge: b64UrlToBuf(opts.challenge),
      rp: opts.rp,
      user: {
        id: b64UrlToBuf(opts.user.id),
        name: opts.user.name,
        displayName: opts.user.displayName,
      },
      pubKeyCredParams: opts.pubKeyCredParams,
      timeout: opts.timeout || 60000,
      attestation: "none",
      authenticatorSelection: opts.authenticatorSelection,
      excludeCredentials: (opts.excludeCredentials || []).map((c) => ({
        type: "public-key",
        id: b64UrlToBuf(c.id),
      })),
    };
    const cred = await navigator.credentials.create({ publicKey });
    if (!cred) throw new Error("Passkey enrollment canceled");
    const credentialId = bufToB64Url(cred.rawId);
    // attestationObject contains the public key inside CBOR — for the demo we
    // ship the raw attestationObject bytes; backend stores them as-is.
    const publicKeyCose = bufToB64Url(cred.response.attestationObject);
    await pkRegFinish({
      credentialId,
      publicKey: publicKeyCose,
      name: nicknameInput.value || "Passkey",
    });
    nicknameInput.value = "";
    await loadCreds();
    open("Passkey 등록 완료!", "success");
  } catch (e) {
    console.error(e);
    open(e?.message?.includes("canceled") ? "취소되었습니다." : "Passkey 등록 실패", "error");
  } finally {
    enrolling.value = false;
  }
}

async function revokeCred(id) {
  if (!window.confirm("이 Passkey를 삭제할까요?")) return;
  try {
    await pkRevoke(id);
    await loadCreds();
    open("삭제되었습니다.", "success");
  } catch (e) {
    open("삭제 실패", "error");
  }
}

function fmtDate(s) {
  if (!s) return "-";
  return new Date(s).toLocaleString();
}
</script>

<template>
  <div class="mypage">
    <h2>My Page</h2>

    <div v-if="loading">Loading...</div>

    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>

      <v-divider class="my-6" />

      <h3 class="text-h6">Passkey</h3>
      <p class="text-body-2 text-medium-emphasis mb-2">
        이 기기에 Passkey를 등록하면 비밀번호 없이 빠르고 안전하게 로그인할 수 있습니다.
      </p>

      <div class="d-flex align-center ga-2 mb-4">
        <v-text-field
          v-model="nicknameInput"
          label="Passkey 이름 (예: MacBook Touch ID)"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 320px"
        />
        <v-btn
          color="primary"
          prepend-icon="mdi-key-plus"
          :loading="enrolling"
          @click="enrollPasskey"
        >
          이 기기에 Passkey 등록
        </v-btn>
      </div>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">등록된 Passkey</v-card-title>
        <v-list density="comfortable" v-if="credentials.length">
          <v-list-item v-for="c in credentials" :key="c.id">
            <template #prepend>
              <v-icon icon="mdi-key" />
            </template>
            <v-list-item-title>{{ c.name }}</v-list-item-title>
            <v-list-item-subtitle>
              등록: {{ fmtDate(c.createdAt) }} ·
              마지막 사용: {{ fmtDate(c.lastUsedAt) }}
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                size="small"
                variant="text"
                color="error"
                icon="mdi-delete"
                @click="revokeCred(c.id)"
              />
            </template>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text-medium-emphasis">
          아직 등록된 Passkey가 없습니다.
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.mypage {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
