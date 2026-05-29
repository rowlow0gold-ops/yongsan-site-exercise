<template>
  <v-card class="rounded-lg" elevation="1">
    <v-card-text class="pa-0">
      <!-- ✅ Skeleton while loading — exactly the size & shape of the real list so no jump -->
      <div v-if="loading" class="board-skel">
        <template v-if="mdAndUp">
          <div class="skel-row skel-head" />
          <div class="skel-row" v-for="i in 10" :key="'sk-'+i" />
        </template>
        <template v-else>
          <div class="skel-mobile" v-for="i in 8" :key="'skm-'+i">
            <div class="skel-line skel-line-title" />
            <div class="skel-line skel-line-meta" />
            <div class="skel-line skel-line-meta" />
          </div>
        </template>
      </div>

      <template v-else-if="mdAndUp">
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          loading-text="불러오는 중..."
          item-value="id"
          class="board1-table comfy-table"
          density="comfortable"
          hide-default-footer
        >
          <template #item.title="{ item }">
            <div
              class="title-cell d-flex align-center ga-2"
              @click="goDetail(item.id)"
            >
              <v-icon v-if="item.visibility === 'PRIVATE'" size="18" class="text-medium-emphasis">mdi-lock</v-icon>
              <span class="text-high-emphasis">{{ item.title }}</span>
            </div>
          </template>

          <template #item.author="{ item }">
            <div class="d-flex align-center ga-1">
              <span>{{ item.author }}</span>
              <v-icon v-if="item.authorUserId" size="16" color="amber-darken-2" title="회원">mdi-star</v-icon>
            </div>
          </template>
        </v-data-table>

        <!-- ✅ Pagination: « < 1 2 3 ... > » -->
        <div class="pagination-wrap" v-if="pageCount > 1">
          <v-btn icon variant="text" size="small" :disabled="page <= 10" @click="$emit('update:page', Math.max(1, page - 10))">
            <v-icon size="18">mdi-chevron-double-left</v-icon>
          </v-btn>
          <v-pagination
            :model-value="page"
            :length="pageCount"
            :total-visible="7"
            @update:modelValue="$emit('update:page', $event)"
          />
          <v-btn icon variant="text" size="small" :disabled="page + 10 > pageCount" @click="$emit('update:page', Math.min(pageCount, page + 10))">
            <v-icon size="18">mdi-chevron-double-right</v-icon>
          </v-btn>
        </div>
      </template>

      <template v-else>
        <div class="pa-5">
          <div
            v-for="item in items"
            :key="item.id"
            class="py-4 mobile-post-item"
            @click="goDetail(item.id)"
          >
            <div class="d-flex align-center ga-2">
              <div class="text-subtitle-1 font-weight-bold">{{ item.id }}</div>
              <v-icon v-if="item.visibility === 'PRIVATE'" size="18" class="text-medium-emphasis">mdi-lock</v-icon>
              <span class="text-high-emphasis">{{ item.title }}</span>
            </div>

            <div class="mt-3 text-body-2">
              <div class="d-flex ga-2">
                <span class="text-medium-emphasis" style="min-width: 64px"
                  >작성자</span
                >
                <span class="d-flex align-center ga-1">{{ item.author }}<v-icon v-if="item.authorUserId" size="14" color="amber-darken-2" title="회원">mdi-star</v-icon></span>
              </div>
              <div class="d-flex ga-2 mt-1">
                <span class="text-medium-emphasis" style="min-width: 64px"
                  >작성일</span
                >
                <span>{{ item.date }}</span>
              </div>
              <div class="d-flex ga-2 mt-1">
                <span class="text-medium-emphasis" style="min-width: 64px"
                  >조회수</span
                >
                <span>{{ item.views }}</span>
              </div>
            </div>

            <v-divider class="mt-4" />
          </div>

          <!-- ✅ Mobile: « < 1 2 3 ... > » -->
          <div class="pagination-wrap" v-if="pageCount > 1">
            <v-btn icon variant="text" size="small" :disabled="page <= 10" @click="$emit('update:page', Math.max(1, page - 10))">
              <v-icon size="18">mdi-chevron-double-left</v-icon>
            </v-btn>
            <v-pagination
              :model-value="page"
              :length="pageCount"
              :total-visible="5"
              @update:modelValue="$emit('update:page', $event)"
            />
            <v-btn icon variant="text" size="small" :disabled="page + 10 > pageCount" @click="$emit('update:page', Math.min(pageCount, page + 10))">
              <v-icon size="18">mdi-chevron-double-right</v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </v-card-text>

    <div class="board-actions">
      <v-btn color="primary" height="40" @click="goWrite">
        <v-icon start icon="mdi-pencil" />
        글쓰기
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

defineProps({
  mdAndUp: { type: Boolean, default: true },
  headers: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },
  loading: { type: Boolean, default: false }, // ← ADD
});

defineEmits(["update:page"]);

function getBoardKey() {
  if (route.name === "board2" || route.path.startsWith("/board2"))
    return "board2";
  return "board1";
}

const currentBoardKey = computed(() => getBoardKey());

function goDetail(id) {
  router.push({
    name: "boardDetail",
    params: { boardKey: currentBoardKey.value, id },
  });
}

function goWrite() {
  router.push({
    name: "boardWrite",
    params: { boardKey: currentBoardKey.value },
  });
}
</script>

<style scoped>
.board1-table :deep(.v-data-table__td),
.board1-table :deep(.v-data-table__th) {
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 18px;
  padding-right: 18px;
}

/* extra breathing room around the data-table inside the card */
.comfy-table {
  padding: 8px 4px;
}


.board1-table :deep(tr:hover td) {
  background: rgba(0, 0, 0, 0.04);
}

.title-cell {
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 4px 0;
}
.title-cell:hover span {
  text-decoration: underline;
}

.board-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  margin-right: 12px;
}

.mobile-post-item {
  cursor: pointer;
}
.mobile-post-item:active {
  background: rgba(0, 0, 0, 0.04);
}

/* ✅ Skeleton (shimmer) — sized to the real rows so the layout doesn't jump
   when v-data-table replaces it. */
.board-skel {
  padding: 8px 4px;
}
.skel-row {
  height: 80px; /* matches real comfy v-data-table rows (20px padding + title-cell + author star line) */
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s linear infinite;
  border-radius: 4px;
  margin: 6px 0;
}
.skel-head {
  height: 56px;
  background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s linear infinite;
}
.skel-mobile {
  padding: 16px 4px;
  border-bottom: 1px solid #f1f5f9;
}
.skel-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s linear infinite;
  margin: 8px 0;
}
.skel-line-title { width: 70%; height: 18px; }
.skel-line-meta  { width: 40%; }
@keyframes skel-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ✅ Prevent pagination from shrinking/collapsing into arrows-only */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  flex: 0 0 auto;
  min-width: 0;
  gap: 0;
}
</style>
