<template>
  <Breadcrumbs :items="breadcrumbs" />

  <v-alert type="info" variant="outlined" class="mb-6">
    Your post may be visible to others. Do not include sensitive personal
    information.
  </v-alert>

  <v-card variant="outlined">
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-row class="align-center">
          <!-- 작성자 -->
          <v-col cols="12" md="2" class="text-grey-darken-1 form-label"
            >작성자</v-col
          >
          <v-col cols="12" md="10" class="form-value">{{ author }}</v-col>

          <!-- 비밀번호 (praise only) -->
          <v-col
            v-if="isPraise && isGuestPost"
            cols="12"
            md="2"
            class="text-grey-darken-1 form-label"
          >
            비밀번호 <span class="text-red">*</span>
          </v-col>
          <v-col
            v-if="isPraise && isGuestPost"
            cols="12"
            md="10"
            class="form-value"
          >
            <v-text-field
              v-model="password"
              type="password"
              variant="outlined"
              density="compact"
              :rules="[rules.pwMin6]"
              placeholder="6자 이상 입력"
              autocomplete="new-password"
              style="max-width: 420px"
              required
            />
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">
            공개여부 <span class="text-red">*</span>
          </v-col>
          <v-col cols="12" md="10">
            <v-radio-group v-model="visibility" inline>
              <v-radio label="공개" value="PUBLIC" />
              <v-radio label="비공개" value="PRIVATE" />
            </v-radio-group>
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">연락처</v-col>
          <v-col cols="12" md="10">
            <div class="d-flex ga-2" style="max-width: 420px">
              <v-select
                v-model="phone1"
                :items="phonePrefixes"
                density="compact"
                variant="outlined"
                style="max-width: 110px"
              />
              <v-text-field
                v-model="phone2"
                density="compact"
                variant="outlined"
                placeholder="0000"
                maxlength="4"
              />
              <v-text-field
                v-model="phone3"
                density="compact"
                variant="outlined"
                placeholder="0000"
                maxlength="4"
              />
            </div>
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">이메일</v-col>
          <v-col cols="12" md="10">
            <div class="d-flex ga-2" style="max-width: 620px">
              <v-text-field
                v-model="emailId"
                density="compact"
                variant="outlined"
                placeholder="id"
              />
              <div class="d-flex align-center">@</div>
              <v-text-field
                v-model="emailDomain"
                density="compact"
                variant="outlined"
                placeholder="domain.com"
                :disabled="emailDomainMode !== 'custom'"
              />
              <v-select
                v-model="emailDomainMode"
                :items="emailDomainOptions"
                density="compact"
                variant="outlined"
                style="max-width: 200px"
                @update:modelValue="onEmailDomainModeChange"
              />
            </div>
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">
            제목 <span class="text-red">*</span>
          </v-col>
          <v-col cols="12" md="10">
            <v-text-field
              v-model="title"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">
            내용 <span class="text-red">*</span>
          </v-col>
          <v-col cols="12" md="10">
            <v-textarea
              v-model="content"
              variant="outlined"
              :rules="[rules.required]"
              rows="10"
              auto-grow
              required
            />
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">첨부파일</v-col>
          <v-col cols="12" md="10">
            <!-- NOTE: real update of files requires backend support.
                 For now we keep it as UI only. -->
            <v-file-input
              v-model="files"
              variant="outlined"
              density="compact"
              multiple
              show-size
              prepend-icon="mdi-paperclip"
              hint="Up to 500MB (example)"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="12">
            <v-divider class="my-4" />

            <v-card variant="flat" class="pa-3 bg-grey-lighten-4">
              <div class="text-subtitle-2 mb-2">
                개인정보 수집·이용 안내 (example section)
              </div>

              <v-table density="compact">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>필수항목</th>
                    <th>선택항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>수집·이용할 개인정보 대상</td>
                    <td>이름, 전화번호</td>
                    <td>이메일</td>
                  </tr>
                </tbody>
              </v-table>

              <v-checkbox
                v-model="agree"
                label="동의"
                class="mt-2"
                :rules="[rules.mustAgree]"
              />
            </v-card>
          </v-col>

          <v-col cols="12" class="d-flex justify-end ga-2 mt-4">
            <v-btn
              variant="outlined"
              @click="goDetail"
              :disabled="loading || saving"
            >
              취소
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="saving"
              :disabled="loading"
            >
              수정
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { useLeaveGuard } from "@/composables/useLeaveGuard";
import Breadcrumbs from "@/components/participation/Breadcrumbs.vue";
import api from "@/lib/api";

const { open } = useAlert();

const route = useRoute();
const router = useRouter();

const auth = useAuthStore();

const authorUserId = ref(null);
const isGuestPost = computed(() => authorUserId.value == null);
const isLoggedIn = computed(() => auth.isAuthed);

const boardKey = ref(route.params.boardKey);
if (!boardKey.value) {
  throw new Error("boardKey is missing in route");
}

const id = ref(route.params.id);

const isPraise = computed(() => String(boardKey.value) === "board1");

const password = ref("");
const pwKey = computed(() => `boardPostPw:${boardKey.value}:${id.value}`);

onMounted(async () => {
  if (auth.isAuthed && auth.user?.name) {
    author.value = auth.user.name;
  }
  await loadPost(); // ✅ load first (so we know authorUserId)
});

const breadcrumbs = ref([
  { title: "HOME", to: "/" },
  { title: "참여소통" },
  { title: "구민의견/참여" },
  { title: "칭찬합시다", disabled: true },
  { title: "수정", disabled: true },
]);

const author = ref("무명");
const visibility = ref("PUBLIC");

const phonePrefixes = ["010", "011", "016", "017", "018", "019"];
const phone1 = ref("010");
const phone2 = ref("");
const phone3 = ref("");

const emailId = ref("");
const emailDomain = ref("");
const emailDomainMode = ref("custom");
const emailDomainOptions = [
  { title: "직접입력", value: "custom" },
  { title: "gmail.com", value: "gmail.com" },
  { title: "naver.com", value: "naver.com" },
  { title: "daum.net", value: "daum.net" },
];

const title = ref("");
const content = ref("");
const files = ref([]);
const agree = ref(true);

const formRef = ref(null);

const loading = ref(false);
const saving = ref(false);

// Track original values to detect changes
const original = ref({ title: "", content: "" });

const { markSubmitted } = useLeaveGuard(
  () => title.value !== original.value.title || content.value !== original.value.content,
);

const rules = {
  required: (v) => !!v || "Required",
  mustAgree: (v) => v === true || "You must agree",
  pwMin6: (v) =>
    !isPraise.value ||
    (v && v.length >= 6) ||
    "Password must be at least 6 characters.",
};

function onEmailDomainModeChange(mode) {
  if (mode === "custom") emailDomain.value = "";
  else emailDomain.value = mode;
}

function goDetail() {
  router.push({
    name: "boardDetail",
    params: { boardKey: boardKey.value, id: id.value },
  });
}

function splitPhone(phone) {
  if (!phone) return;
  const parts = String(phone).split("-");
  phone1.value = parts[0] || "010";
  phone2.value = parts[1] || "";
  phone3.value = parts[2] || "";
}

function splitEmail(email) {
  if (!email) return;
  const [idPart, domainPart] = String(email).split("@");
  emailId.value = idPart || "";
  emailDomain.value = domainPart || "";
  const predefined = ["gmail.com", "naver.com", "daum.net"];
  emailDomainMode.value = predefined.includes(emailDomain.value)
    ? emailDomain.value
    : "custom";
}

// ✅ Load existing post (GET)
async function loadPost() {
  loading.value = true;
  try {
    const res = await api.get(
      `/api/boards/${boardKey.value}/posts/${id.value}`,
    );

    const data = res.data;

    authorUserId.value = data.authorUserId ?? null;

    // If this is a guest post on praise board, we need password from sessionStorage
    if (isPraise.value && isGuestPost.value) {
      password.value = sessionStorage.getItem(pwKey.value) || "";

      if (!password.value || password.value.length < 6) {
        alert(
          "비밀번호 확인이 필요합니다. 상세페이지에서 수정 버튼을 눌러주세요.",
        );
        router.replace({
          name: "boardDetail",
          params: { boardKey: boardKey.value, id: id.value },
        });
        return;
      }
    } else {
      // member post: never keep password
      password.value = "";
    }

    author.value = data.author ?? author.value;
    visibility.value = data.visibility ?? "PUBLIC";
    title.value = data.title ?? "";
    content.value = data.content ?? "";
    agree.value = data.agree ?? true;

    splitPhone(data.phone);
    splitEmail(data.email);

    files.value = [];

    // Snapshot for dirty check
    original.value = { title: title.value, content: content.value };
  } catch (e) {
    console.error(e);
    alert("Failed to load post.");
    goDetail();
  } finally {
    loading.value = false;
  }
}

// ✅ Update (PUT)
async function onSubmit() {
  const form = formRef.value;
  if (!form) return;

  const { valid } = await form.validate();
  if (!valid) return;
  if (
    isPraise.value &&
    isGuestPost.value &&
    (!password.value || password.value.length < 6)
  ) {
    alert("비밀번호는 6자 이상 입력해주세요.");
    return;
  }

  const payload = {
    author: author.value,
    visibility: visibility.value,
    phone: [phone1.value, phone2.value, phone3.value].filter(Boolean).join("-"),
    email:
      emailId.value && emailDomain.value
        ? `${emailId.value}@${emailDomain.value}`
        : "",
    title: title.value,
    content: content.value,
    agree: agree.value,
    ...(isPraise.value && isGuestPost.value
      ? { password: password.value }
      : {}),
  };

  saving.value = true;
  try {
    await api.put(`/api/boards/${boardKey.value}/posts/${id.value}`, payload);
    markSubmitted();
    sessionStorage.removeItem(pwKey.value);
    open("게시글이 수정되었습니다.", "success");
    goDetail();
  } catch (e) {
    console.error(e);
    open("수정에 실패했습니다.", "error");
  } finally {
    saving.value = false;
  }
}
</script>
