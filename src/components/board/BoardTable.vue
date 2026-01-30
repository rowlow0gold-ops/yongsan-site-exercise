<template>
  <v-card class="rounded-lg" elevation="1">
    <v-card-text class="pa-0">
      <template v-if="mdAndUp">
        <v-data-table
          :headers="headers"
          :items="items"
          item-value="id"
          class="board1-table"
          density="comfortable"
          hide-default-footer
        >
          <template #item.title="{ item }">
            <div class="d-flex align-center ga-2">
              <v-icon size="18" class="text-medium-emphasis">mdi-lock</v-icon>
              <RouterLink
                class="text-decoration-none text-high-emphasis"
                :to="{ name: 'board1-detail', params: { id: item.id } }"
              >
                {{ item.title }}
              </RouterLink>
            </div>
          </template>
        </v-data-table>

        <div class="d-flex justify-center py-4">
          <v-pagination
            :model-value="page"
            @update:modelValue="$emit('update:page', $event)"
            :length="pageCount"
            rounded="lg"
            density="comfortable"
          />
        </div>
      </template>

      <template v-else>
        <div class="pa-5">
          <div v-for="item in items" :key="item.id" class="py-4">
            <div class="d-flex align-center ga-2">
              <div class="text-subtitle-1 font-weight-bold">{{ item.id }}</div>
              <v-icon size="18" class="text-medium-emphasis">mdi-lock</v-icon>
              <RouterLink
                class="text-decoration-none text-high-emphasis"
                :to="{ name: 'board1-detail', params: { id: item.id } }"
              >
                {{ item.title }}
              </RouterLink>
            </div>

            <div class="mt-3 text-body-2">
              <div class="d-flex ga-2">
                <span class="text-medium-emphasis" style="min-width: 64px"
                  >작성자</span
                >
                <span>{{ item.author }}</span>
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

          <div class="d-flex justify-center py-2">
            <v-pagination
              :model-value="page"
              @update:modelValue="$emit('update:page', $event)"
              :length="pageCount"
              rounded="lg"
              density="comfortable"
            />
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
import { RouterLink } from "vue-router";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

defineProps({
  mdAndUp: { type: Boolean, default: true },
  headers: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },
});
defineEmits(["update:page"]);

function goWrite() {
  router.replace('/board1/write')
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
</style>
