<template>
  <FiltersCard
    v-model:from="filters.from"
    v-model:to="filters.to"
    v-model:field="filters.field"
    v-model:q="filters.q"
    :field-items="fieldItems"
    :md-and-up="mdAndUp"
    @apply="apply"
    @reset="reset"
  />

  <div class="d-flex align-center justify-space-between mt-6 mb-3">
    <div class="text-body-2 text-medium-emphasis">
      총 <span class="text-primary font-weight-bold">{{ total }}</span> 건
      <span class="text-medium-emphasis"
        >({{ page }} / {{ pageCount }} 페이지)</span
      >
    </div>
    <div class="text-body-2 text-primary">
      ※ 글쓰기 기능은 로그인 후에 이용 가능하지만, 테스트 기간 중에는 자유롭게
      가능합니다.
    </div>
  </div>

  <BoardTable
    :md-and-up="mdAndUp"
    :headers="headers"
    :items="pagedItems"
    :page="page"
    :page-count="pageCount"
    @update:page="page = $event"
  />
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";

import FiltersCard from "@/components/board/FiltersCard.vue";
import BoardTable from "@/components/board/BoardTable.vue";

const router = useRouter();
const { mdAndUp } = useDisplay();

const filters = reactive({ from: "", to: "", field: "title", q: "" });

const fieldItems = [
  { title: "제목", value: "title" },
  { title: "작성자", value: "author" },
];

const items = ref([
  {
    id: 285,
    title: "주택과 남지영 주무관님을 칭찬합니다.",
    author: "이**",
    date: "2026-01-26",
    views: 2,
  },
  {
    id: 284,
    title: "여권민원과 정지원 선생님 친절하십니다",
    author: "김**",
    date: "2026-01-23",
    views: 12,
  },
  // ...
]);

const perPage = 10;
const page = ref(1);

const headers = [
  { title: "번호", key: "id", width: 90 },
  { title: "제목", key: "title" },
  { title: "작성자", key: "author", width: 120 },
  { title: "작성일", key: "date", width: 140 },
  { title: "조회수", key: "views", width: 110 },
];

const filtered = computed(() => {
  let list = items.value.slice();
  if (filters.from) list = list.filter((x) => x.date >= filters.from);
  if (filters.to) list = list.filter((x) => x.date <= filters.to);

  const q = filters.q?.trim();
  if (q) {
    const key = filters.field === "author" ? "author" : "title";
    list = list.filter((x) => String(x[key]).includes(q));
  }
  list.sort((a, b) => b.id - a.id);
  return list;
});

const total = computed(() => filtered.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / perPage)));

const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage;
  return filtered.value.slice(start, start + perPage);
});

function apply() {
  page.value = 1;
}
function reset() {
  filters.from = "";
  filters.to = "";
  filters.field = "title";
  filters.q = "";
  page.value = 1;
}
</script>

<style scoped></style>
