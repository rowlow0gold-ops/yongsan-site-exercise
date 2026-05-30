<template>
  <v-dialog v-model="open" max-width="440" persistent>
    <v-card rounded="xl" class="pa-6 text-center">
      <div class="d-flex justify-end">
        <v-btn icon variant="text" size="small" :disabled="enrolling" @click="laterDismiss">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-icon size="64" color="primary" class="mb-2">mdi-fingerprint</v-icon>
      <h3 class="text-h6 mb-2">이 기기에 Passkey를 등록할까요?</h3>
      <p class="text-body-2 text-medium-emphasis mb-3">
        다음 로그인부터는 지문, Face ID 또는 PIN으로 바로 들어올 수 있어요.
        Passkey는 이 기기의 비밀번호 관리자(iCloud Keychain, Google Password Manager 등)에
        안전하게 저장되며, 동일 계정의 다른 기기로도 동기화됩니다.
      </p>
      <div class="device-chip mb-5">
        <v-icon size="18" color="primary" class="mr-1">mdi-devices</v-icon>
        <span class="text-body-2">저장될 이름: <strong>{{ autoName }}</strong></span>
      </div>

      <v-btn
        block color="primary" size="large" class="mb-2"
        prepend-icon="mdi-key-variant"
        :loading="enrolling"
        @click="enroll"
      >
        Passkey 등록
      </v-btn>
      <v-btn block variant="text" :disabled="enrolling" @click="laterDismiss">나중에</v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import {
  registerStart as pkRegStart,
  registerFinish as pkRegFinish,
  listCredentials as pkList,
} from "@/api/webauthn";
import { bufToB64Url, b64UrlToBuf } from "@/lib/webauthn";
import { detectPasskeyName } from "@/lib/passkeyName";

const auth = useAuthStore();
const { open: toast } = useAlert();

const open = ref(false);
const enrolling = ref(false);

// System-generated name (no user input). Examples:
//   "Mac · Touch ID", "iPhone · Face ID", "Android · 지문", "Windows · Hello"
const autoName = computed(() => detectPasskeyName());

// Persistent skip — once the user clicks 나중에 we never auto-prompt again on
// this device. They can still enroll explicitly from /mypage anytime, and if
// they later enroll, the prompt would have stopped firing anyway (it only
// shows when the user has zero credentials).
function skipKey(uid) { return `pk-prompt-skip:${uid}`; }

async function maybePrompt() {
  if (!auth.isAuthed || !auth.user?.id) return;
  if (typeof window === "undefined" || !window.PublicKeyCredential) return;
  if (localStorage.getItem(skipKey(auth.user.id)) === "1") return;

  // Only prompt on devices that actually have a platform authenticator
  // (Touch ID / Hello / fingerprint / passcode). Otherwise the create() call
  // would just fail and confuse the user.
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      const has = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!has) return;
    }
  } catch (_) { return; }

  try {
    const { data } = await pkList();
    const credentials = Array.isArray(data) ? data : (data?.credentials || []);
    if (credentials.length === 0) {
      open.value = true;
    }
  } catch (_) {
    // 401 during bootstrap (cookie not yet set after OAuth exchange) — skip
    // silently; the next login attempt will retrigger.
  }
}

function laterDismiss() {
  if (auth.user?.id) localStorage.setItem(skipKey(auth.user.id), "1");
  open.value = false;
}

async function enroll() {
  if (enrolling.value) return;
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
    if (!cred) throw new Error("canceled");

    await pkRegFinish({
      credentialId: bufToB64Url(cred.rawId),
      publicKey: bufToB64Url(cred.response.attestationObject),
      name: autoName.value.slice(0, 60),
    });

    toast("Passkey 등록 완료! 다음 로그인부터 사용할 수 있어요.", "success");
    open.value = false;
  } catch (e) {
    console.error(e);
    const msg = String(e?.message || "");
    if (msg.includes("canceled") || e?.name === "NotAllowedError") {
      toast("취소되었습니다.", "warning");
    } else {
      toast("Passkey 등록 실패. 잠시 후 다시 시도해주세요.", "error");
    }
  } finally {
    enrolling.value = false;
  }
}

// Fire whenever the user becomes authed (login success, OAuth exchange, or
// page reload while a valid cookie is still around). Single hook = covers
// every login path without touching each handler.
watch(
  () => (auth.isAuthed ? auth.user?.id : null),
  (uid, prev) => {
    if (uid && uid !== prev) maybePrompt();
  },
  { immediate: true }
);
</script>


