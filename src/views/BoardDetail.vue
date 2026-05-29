<template>
  <div class="detail-wrap">
    <!-- ✅ Title Area -->
    <div class="title-area">
      <h2 class="post-title">{{ post.title }}</h2>

      <div class="meta-box">
        <table class="meta-table">
          <tbody>
            <tr>
              <th>Author</th>
              <td>{{ post.author }}</td>
              <th>Created</th>
              <td>{{ post.createdAt }}</td>
              <th>Views</th>
              <td>{{ post.views }}</td>
            </tr>
            <tr>
              <th>Attachments</th>
              <td colspan="5">
                <span v-if="post.attachments.length" class="files">
                  <span
                    v-for="(f, idx) in post.attachments"
                    :key="idx"
                    class="file-pill"
                  >
                    {{ f.name }}
                  </span>
                </span>
                <span v-else class="muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ✅ Content Area — skeleton during fetch, fade-in once loaded -->
    <div class="content-area">
      <div v-if="loading" class="detail-skel">
        <div class="detail-skel-line" v-for="i in 8" :key="'ds-'+i" />
      </div>
      <template v-else>
        <p v-for="(p, idx) in post.content" :key="idx" class="paragraph">
          {{ p }}
        </p>
      </template>
    </div>
    <div class="d-flex align-center ga-2">
      <!-- Left group -->
      <v-btn
        v-if="canModify"
        color="primary"
        variant="flat"
        @click="onEditClick"
      >
        수정
      </v-btn>

      <v-btn
        v-if="canModify"
        color="error"
        variant="outlined"
        :loading="deleting"
        :disabled="deleting"
        @click="onDeleteClick"
      >
        삭제
      </v-btn>

      <!-- Push everything after this to the far right -->
      <div class="ms-auto">
        <v-btn variant="outlined" @click="goList"> 목록 </v-btn>
      </div>
    </div>
  </div>
  <v-dialog v-model="pwDialog" max-width="420">
    <v-card>
      <v-card-title class="text-subtitle-1"> 비밀번호 확인 </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="pw"
          type="text"
          label="비밀번호 (6자 이상)"
          variant="outlined"
          density="compact"
          autocomplete="one-time-code"
          name="board-pin"
          style="-webkit-text-security: disc;"
          :error-messages="pwError ? [pwError] : []"
          @keyup.enter="confirmPw"
        />
        <div class="text-caption text-grey-darken-1">
          칭찬합시다 게시판은 비회원 수정/삭제 시 비밀번호가 필요합니다.
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="pwDialog = false">취소</v-btn>
        <v-btn color="primary" variant="flat" @click="confirmPw">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchBoardDetail, unlockBoardPost, deleteBoardPost } from "@/api/board";
import { useAuthStore } from "@/stores/auth";
import { useAlert } from "@/composables/useAlert";
import { useSeo } from "@/composables/useSeo";

const { open } = useAlert();

const auth = useAuthStore();

const isMemberPost = computed(() => {
  return !!post.value.authorUserId;
});

const route = useRoute();
const router = useRouter();

const deleting = ref(false);

const pwDialog = ref(false);
const pw = ref("");
const pwAction = ref("delete"); // "delete" | "edit" | "view"
const pwError = ref("");
const showPw = ref(false);

const isPraise = computed(() => boardKey.value === "board1");
const viewPassword = ref(""); // password used to unlock a private guest post

const isOwner = computed(() => {
  if (!auth.isAuthed) return false;
  if (!post.value.authorUserId) return false;
  return auth.user?.id === post.value.authorUserId;
});

const isAdmin = computed(() => auth.user?.role === "ADMIN");

const canModify = computed(() => {
  if (isPraise.value) {
    // guest post → anyone can (password required)
    if (!post.value.authorUserId) return true;
    // member post → owner or admin only
    return isOwner.value || isAdmin.value;
  }

  // other boards → owner or admin
  return isOwner.value || isAdmin.value;
});

async function confirmPw() {
  if (!validatePw()) return;

  if (pwAction.value === "view") {
    // Unlock the private guest post — password goes in the POST body, never the URL.
    try {
      const res = await unlockBoardPost(boardKey.value, id.value, pw.value);
      post.value = normalizeDetail(res.data);
      errorMsg.value = "";
      viewPassword.value = pw.value; // remember for edit/delete
      pwDialog.value = false;
    } catch (e) {
      if (e?.response?.status === 429) {
        pwError.value = "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.";
      } else {
        pwError.value = "비밀번호가 올바르지 않습니다.";
      }
    }
    return;
  }

  // close dialog immediately for snappy UX
  pwDialog.value = false;

  if (pwAction.value === "delete") {
    pwDialog.value = false;
    if (!window.confirm("정말 삭제할까요?")) return;
    deleting.value = true;
    try {
      await deleteBoardPost(boardKey.value, id.value, pw.value);
      open("게시글이 삭제되었습니다.", "success");
      router.replace(`/${boardKey.value}`);
    } catch (e) {
      console.error(e);
      open("비밀번호가 올바르지 않거나 삭제에 실패했습니다.", "error");
    } finally {
      deleting.value = false;
    }
    return;
  }

  // edit
  // store password temporarily so edit page can submit it
  sessionStorage.setItem(`boardPostPw:${boardKey.value}:${id.value}`, pw.value);

  goEdit();
}

function openPwDialog(action) {
  pwAction.value = action;
  pw.value = "";
  pwError.value = "";
  pwDialog.value = true;
}

function onDeleteClick() {
  if (!isPraise.value) {
    if (!window.confirm("정말 삭제할까요?")) return;
    return onDeleteNoPw();
  }

  // Admin can delete any post without password
  if (isAdmin.value) {
    if (!window.confirm("정말 삭제할까요?")) return;
    return onDeleteNoPw();
  }

  if (isMemberPost.value) {
    if (!auth.isAuthed) {
      open("로그인이 필요합니다.", "error");
      return;
    }
    if (!window.confirm("정말 삭제할까요?")) return;
    return onDeleteNoPw();
  }

  // Guest post: password first, confirm after
  openPwDialog("delete");
}

async function onDeleteNoPw() {
  deleting.value = true;
  try {
    await deleteBoardPost(boardKey.value, id.value);
    open("게시글이 삭제되었습니다.", "success");
    router.replace(`/${boardKey.value}`);
  } catch (e) {
    console.error(e);
    open("삭제에 실패했습니다.", "error");
  } finally {
    deleting.value = false;
  }
}

function validatePw() {
  if (!pw.value || pw.value.length < 6) {
    pwError.value = "비밀번호는 6자 이상이어야 합니다.";
    return false;
  }
  pwError.value = "";
  return true;
}

function onEditClick() {
  if (!isPraise.value) return goEdit();

  // Admin can edit any post without password
  if (isAdmin.value) return goEdit();

  if (isMemberPost.value) {
    if (!auth.isAuthed) {
      open("로그인이 필요합니다.", "error");
      return;
    }
    return goEdit();
  }

  openPwDialog("edit");
}

async function onDelete() {
  const ok = window.confirm("정말 삭제할까요?");
  if (!ok) return;

  deleting.value = true;
  try {
    await deleteBoardPost(boardKey.value, id.value);

    // go back to the list page
    router.replace(`/${boardKey.value}`);
  } catch (e) {
    console.error(e);
    window.alert("삭제에 실패했습니다.");
  } finally {
    deleting.value = false;
  }
}

// If you are passing props via router (props: true), keep this.
// If not, we’ll fallback to route params below.
const props = defineProps({
  boardKey: { type: String, required: false },
  id: { type: [String, Number], required: false },
});

const boardKey = computed(() =>
  String(props.boardKey ?? route.params.boardKey ?? ""),
);
const id = computed(() => String(props.id ?? route.params.id ?? ""));

function toYmd(v) {
  if (!v) return "-";
  return String(v).slice(0, 10);
}

function normalizeDetail(p) {
  // backend detail DTO: id, boardKey, title, author, content, createdAt, updatedAt
  return {
    title: p.title ?? "-",
    author: p.author ?? "-",
    createdAt: toYmd(p.createdAt ?? p.created_at),
    views: p.views ?? 0,
    attachments: p.attachments ?? [],
    content: Array.isArray(p.content)
      ? p.content
      : String(p.content ?? "")
          .split("\n")
          .filter(Boolean),

    // 👇 add this
    authorUserId: p.authorUserId ?? null,
  };
}

const loading = ref(false);
const errorMsg = ref("");

const post = ref({
  title: "",
  author: "-",
  createdAt: "-",
  views: 0,
  attachments: [],
  content: [],
});

const boardLabel = computed(() => boardKey.value === "board2" ? "나도한마디" : "칭찬합시다");
useSeo({ title: computed(() => post.value.title ? `${post.value.title} — ${boardLabel.value}` : boardLabel.value), description: computed(() => post.value.title || "게시글 상세"), path: `/${boardKey.value}/${id.value}` });

async function loadDetail() {
  if (!boardKey.value || !id.value) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    const res = await fetchBoardDetail(boardKey.value, id.value);
    post.value = normalizeDetail(res.data);
  } catch (e) {
    console.error(e);

    const status = e?.response?.status;
    if (status === 403) {
      const isGuestPrivate = e.response?.data?.guestPost === true;

      if (isGuestPrivate) {
        // Guest private post → offer password dialog
        errorMsg.value = "비공개 게시글입니다.";
        post.value = {
          title: "비공개 게시글",
          author: "-",
          createdAt: "-",
          views: 0,
          attachments: [],
          content: ["비밀번호를 입력하면 열람할 수 있습니다."],
          authorUserId: null,
        };
        openPwDialog("view");
        return;
      }

      // Member private post → login required, no password option
      errorMsg.value = "비공개 게시글입니다.";
      post.value = {
        title: "비공개 게시글",
        author: "-",
        createdAt: "-",
        views: 0,
        attachments: [],
        content: ["작성자 본인 또는 관리자만 열람할 수 있습니다."],
        authorUserId: null,
      };
      return;
    }
    if (boardKey.value === "board2" && status === 401) {
      errorMsg.value = "로그인이 필요합니다.";
      post.value = {
        ...post.value,
        content: ["로그인 후 내용을 확인할 수 있습니다."],
      };
      return;
    }

    errorMsg.value = `Post not found (boardKey=${boardKey.value}, id=${id.value})`;
    post.value = {
      title: errorMsg.value,
      author: "-",
      createdAt: "-",
      views: 0,
      attachments: [],
      content: ["No record exists for this id."],
    };
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);

// reload when route changes (e.g., clicking different post)
watch([boardKey, id], loadDetail);

function goEdit() {
  router.push({
    name: "boardEdit",
    params: { boardKey: boardKey.value, id: id.value },
  });
}

function goList() {
  router.replace(`/${boardKey.value}`);
}
</script>

<style scoped>
.detail-wrap {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}

/* Title Area */
.title-area {
  margin-bottom: 18px;
}

.post-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin: 10px 0 14px;
}

.meta-box {
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.meta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.meta-table th {
  width: 110px;
  background: #f7f7f7;
  padding: 10px 12px;
  text-align: left;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.meta-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.files {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.file-pill {
  padding: 4px 10px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 12px;
}

.muted {
  color: #9ca3af;
}

/* Content Area */
.content-area {
  padding: 28px 16px;
  min-height: 320px;
  background: #fff;
  border-radius: 8px;
  margin: 16px 0 24px;
}

.paragraph {
  line-height: 1.85;
  margin: 0 0 16px;
  font-size: 15px;
  color: #1f2937;
  word-break: break-word;
}

.paragraph:last-child {
  margin-bottom: 0;
}

/* Skeleton paragraphs — sized to look like real prose so no shift when real content arrives */
.detail-skel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.detail-skel-line {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s linear infinite;
}
.detail-skel-line:nth-child(odd)  { width: 95%; }
.detail-skel-line:nth-child(even) { width: 80%; }
.detail-skel-line:last-child       { width: 45%; }
@keyframes skel-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Cross-fade when the detail body swaps in (after fetch) */
.content-area {
  animation: contentFadeIn 240ms ease both;
}
@keyframes contentFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
