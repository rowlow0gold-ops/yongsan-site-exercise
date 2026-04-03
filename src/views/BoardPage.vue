<template>
  <FiltersCard
    v-model:q="filters.q"
    v-model:field="filters.field"
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
      {{ notice }}
    </div>
  </div>

  <BoardTable
    :md-and-up="mdAndUp"
    :headers="headers"
    :items="items"
    :loading="loading"
    :page="page"
    :page-count="pageCount"
    @update:page="onPage"
  />
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import FiltersCard from "@/components/board/FiltersCard.vue";
import BoardTable from "@/components/board/BoardTable.vue";
import { fetchBoardList } from "@/api/board";

const props = defineProps({
  boardKey: { type: String, required: true },
  notice: { type: String, default: "" },
});

const { mdAndUp } = useDisplay();

const filters = reactive({ field: "title", q: "" });

const fieldItems = [
  { title: "제목", value: "title" },
  { title: "작성자", value: "author" },
];

const headers = [
  { title: "번호", key: "id", width: 90 },
  { title: "제목", key: "title" },
  { title: "작성자", key: "author", width: 120 },
  { title: "작성일", key: "date", width: 140 },
  { title: "조회수", key: "views", width: 110 },
];

function toYmd(v) {
  if (!v) return "";
  return String(v).slice(0, 10);
}
function mapPost(p) {
  return {
    id: p.id,
    title: p.title,
    author: p.author,
    date: toYmd(p.createdAt ?? p.created_at ?? p.date),
    views: p.views ?? 0,
  };
}

const items = ref([]);
const total = ref(0);

const page = ref(1);
const perPage = ref(10);

const pageCount = computed(() => {
  const t = Number(total.value) || 0;
  const s = Number(perPage.value) || 10;
  return Math.max(1, Math.ceil(t / s));
});

const loading = ref(false);
const errorMsg = ref("");

let reqNo = 0;

async function load() {
  const myNo = ++reqNo;
  loading.value = true;
  errorMsg.value = "";

  // ✅ offset for backends that use `from`
  const from = (page.value - 1) * perPage.value;

  try {
    const res = await fetchBoardList(props.boardKey, {
      // send both: backend can ignore what it doesn’t use
      page: page.value,
      size: perPage.value,
      from,
      q: filters.q?.trim() || "",
      field: filters.field,
    });

    if (myNo !== reqNo) return;

    const data = res.data ?? {};
    items.value = (data.items ?? []).map(mapPost);

    if (typeof data.total === "number") total.value = data.total;
    else if (typeof data.count === "number") total.value = data.count;

    // ✅ if total changed and current page is now out of range, clamp and reload once
    if (page.value > pageCount.value) {
      page.value = pageCount.value;
      // prevent infinite loops: only reload if we actually changed page
      if (page.value !== 1) await load();
    }
  } catch (e) {
    console.error(e);
    if (myNo !== reqNo) return;

    errorMsg.value = "목록을 불러오지 못했습니다.";
    items.value = [];
  } finally {
    if (myNo === reqNo) loading.value = false;
  }
}

function onPage(p) {
  page.value = p;
  load();
}

function apply() {
  page.value = 1;
  load();
}

function reset() {
  filters.field = "title";
  filters.q = "";
  page.value = 1;
  load();
}

onMounted(load);

watch(
  () => props.boardKey,
  () => {
    page.value = 1;
    load();
  },
);
</script>
