<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { meApi, deleteAccountApi, updateProfileApi } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import {
  registerStart as pkRegStart,
  registerFinish as pkRegFinish,
  listCredentials as pkList,
  revokeCredential as pkRevoke,
} from "@/api/webauthn";
import { bufToB64Url, b64UrlToBuf } from "@/lib/webauthn";
import { detectPasskeyName } from "@/lib/passkeyName";
import { useAlert } from "@/composables/useAlert";
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "마이페이지", description: "내 정보 확인", path: "/mypage" });

const router = useRouter();
const auth = useAuthStore();

const { open } = useAlert();

const loading = ref(true);
const user = ref(null);
const error = ref(null);

const credentials = ref([]);
const credLoading = ref(false);
const enrolling = ref(false);
// System-assigned passkey name. We don't ask the user — Microsoft/Apple/
// Google all auto-name based on device, and a user-typed nickname is
// usually forgettable garbage.
const autoPasskeyName = detectPasskeyName();

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
    await pkRegFinish({
      credentialId: bufToB64Url(cred.rawId),
      attestationObject: bufToB64Url(cred.response.attestationObject),
      clientDataJSON: bufToB64Url(cred.response.clientDataJSON),
      name: autoPasskeyName,
    });
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

// --- 탈퇴 ---
const deleteDialog = ref(false);
const deleteConfirmText = ref("");
const deleting = ref(false);
const DELETE_PHRASE = "탈퇴합니다";

// --- Edit name ---
const editingName = ref(false);
const nameDraft = ref("");
const savingName = ref(false);
const nameDraftError = computed(() => {
  const v = (nameDraft.value || "").trim();
  if (!v) return "이름을 입력해주세요.";
  if (v.length < 2) return "이름은 2자 이상이어야 합니다.";
  if (v.length > 50) return "이름은 50자 이하여야 합니다.";
  return "";
});
function startEditName() {
  nameDraft.value = user.value?.name || "";
  editingName.value = true;
}
function cancelEditName() {
  editingName.value = false;
  nameDraft.value = "";
}
async function saveName() {
  if (nameDraftError.value || savingName.value) return;
  savingName.value = true;
  try {
    const { data } = await updateProfileApi({ name: nameDraft.value.trim() });
    user.value = data;
    // Reflect into the auth store so the sticky header / other pages see it.
    auth.setUser(data);
    editingName.value = false;
    open("이름이 변경되었습니다.", "success");
  } catch (e) {
    open(e?.response?.data?.message || "이름 변경 실패", "error");
  } finally {
    savingName.value = false;
  }
}

async function confirmDelete() {
  if (deleteConfirmText.value !== DELETE_PHRASE) return;
  deleting.value = true;
  try {
    await deleteAccountApi();
    auth.clearAuth();
    deleteDialog.value = false;
    open("탈퇴 처리되었습니다. 그동안 이용해주셔서 감사합니다.", "success");
    router.push("/");
  } catch (e) {
    console.error(e);
    open("탈퇴 실패. 잠시 후 다시 시도해주세요.", "error");
  } finally {
    deleting.value = false;
  }
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

      <div class="d-flex align-center ga-2 mb-2">
        <strong>Name:</strong>
        <template v-if="!editingName">
          <span>{{ user.name }}</span>
          <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="startEditName" />
        </template>
        <template v-else>
          <v-text-field
            v-model="nameDraft"
            density="compact"
            variant="outlined"
            hide-details="auto"
            :error-messages="nameDraftError"
            :error="!!nameDraftError"
            maxlength="50"
            counter="50"
            style="max-width: 280px"
            autocomplete="off"
            @keyup.enter="saveName"
            @keyup.esc="cancelEditName"
          />
          <v-btn size="small" color="primary" :loading="savingName" :disabled="!!nameDraftError" @click="saveName">
            저장
          </v-btn>
          <v-btn size="small" variant="text" :disabled="savingName" @click="cancelEditName">
            취소
          </v-btn>
        </template>
      </div>

      <p><strong>Role:</strong> {{ user.role }}</p>

      <v-divider class="my-6" />

      <h3 class="text-h6">Passkey</h3>
      <p class="text-body-2 text-medium-emphasis mb-2">
        이 기기에 Passkey를 등록하면 비밀번호 없이 빠르고 안전하게 로그인할 수 있습니다.
      </p>

      <div class="d-flex align-center ga-2 mb-4 flex-wrap">
        <v-chip color="primary" variant="tonal" prepend-icon="mdi-devices">
          저장될 이름: {{ autoPasskeyName }}
        </v-chip>
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

      <v-divider class="my-8" />

      <h3 class="text-h6 text-error">계정 탈퇴</h3>
      <p class="text-body-2 text-medium-emphasis mb-3">
        탈퇴하면 등록된 Passkey, 로그인 세션, 만족도 응답이 영구적으로 삭제됩니다.
        게시판에 작성한 글의 내용은 보존되지만 작성자는 "탈퇴한 회원"으로 표시되며
        본인 확인이 불가능해 수정/삭제할 수 없습니다. 이 작업은 되돌릴 수 없습니다.
      </p>
      <v-btn variant="outlined" color="error" prepend-icon="mdi-account-remove" @click="deleteDialog = true">
        탈퇴하기
      </v-btn>
    </div>

    <!-- 탈퇴 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="480" persistent>
      <v-card rounded="xl" class="pa-6">
        <h3 class="text-h6 mb-2 text-error">정말 탈퇴하시겠습니까?</h3>
        <p class="text-body-2 mb-4">
          이 작업은 즉시 적용되며 되돌릴 수 없습니다. 계속 진행하려면
          아래 입력란에 <strong>{{ DELETE_PHRASE }}</strong>를 입력해주세요.
        </p>
        <v-text-field
          v-model="deleteConfirmText"
          :placeholder="DELETE_PHRASE"
          variant="outlined"
          density="comfortable"
          autofocus
          hide-details
          class="mb-4"
        />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" :disabled="deleting" @click="deleteDialog = false; deleteConfirmText = ''">
            취소
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            :disabled="deleteConfirmText !== DELETE_PHRASE"
            @click="confirmDelete"
          >
            영구 탈퇴
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.mypage {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
