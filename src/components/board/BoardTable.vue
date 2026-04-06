<template>
  <v-card class="rounded-lg" elevation="1">
    <v-card-text class="pa-0">
      <template v-if="mdAndUp">
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          loading-text="불러오는 중..."
          item-value="id"
          class="board1-table"
          density="comfortable"
          hide-default-footer
        >
          <template #item.title="{ item }">
            <div class="d-flex align-center ga-2">
              <v-icon v-if="item.visibility === 'PRIVATE'" size="18" class="text-medium-emphasis">mdi-lock</v-icon>
              <RouterLink
                class="text-decoration-none text-high-emphasis"
                :to="{
                  name: 'boardDetail',
                  params: { boardKey: currentBoardKey, id: item.id },
                }"
              >
                {{ item.title }}
              </RouterLink>
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
          <div v-for="item in items" :key="item.id" class="py-4">
            <div class="d-flex align-center ga-2">
              <div class="text-subtitle-1 font-weight-bold">{{ item.id }}</div>
              <v-icon v-if="item.visibility === 'PRIVATE'" size="18" class="text-medium-emphasis">mdi-lock</v-icon>
              <RouterLink
                class="text-decoration-none text-high-emphasis"
                :to="{
                  name: 'boardDetail',
                  params: { boardKey: currentBoardKey, id: item.id },
                }"
              >
                {{ item.title }}
              </RouterLink>
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
import { RouterLink, useRouter, useRoute } from "vue-router";

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
  padding-top: 14px;
  padding-bottom: 14px;
}

.board-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  margin-right: 12px;
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
