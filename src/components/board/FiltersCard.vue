<template>
  <v-card class="rounded-lg" elevation="1">
    <v-card-text>
      <div class="filters-grid">
        <DateField v-model="fromModel" label="시작날짜" :md-and-up="mdAndUp" />
        <DateField v-model="toModel" label="종료날짜" :md-and-up="mdAndUp" />

        <v-select
          v-model="fieldModel"
          :items="fieldItems"
          label="제목"
          variant="outlined"
          density="comfortable"
          hide-details
        />

        <div class="search-row">
          <v-text-field
            v-model="qModel"
            label="검색어 입력"
            variant="outlined"
            density="comfortable"
            hide-details
          />
          <v-btn
            color="primary"
            height="44"
            min-width="52"
            @click="$emit('apply')"
          >
            <v-icon icon="mdi-magnify" />
          </v-btn>
          <v-btn
            variant="outlined"
            height="44"
            min-width="52"
            @click="$emit('reset')"
          >
            <v-icon icon="mdi-refresh" />
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import DateField from "@/components/DateField.vue";

const props = defineProps({
  from: { type: String, default: "" },
  to: { type: String, default: "" },
  field: { type: String, default: "title" },
  q: { type: String, default: "" },
  fieldItems: { type: Array, default: () => [] },
  mdAndUp: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:from",
  "update:to",
  "update:field",
  "update:q",
  "apply",
  "reset",
]);

const fromModel = computed({
  get: () => props.from,
  set: (v) => emit("update:from", v),
});
const toModel = computed({
  get: () => props.to,
  set: (v) => emit("update:to", v),
});
const fieldModel = computed({
  get: () => props.field,
  set: (v) => emit("update:field", v),
});
const qModel = computed({
  get: () => props.q,
  set: (v) => emit("update:q", v),
});
</script>

<style scoped>
.filters-grid {
  display: grid;
  gap: 12px;
  align-items: center;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr 52px 52px;
  gap: 12px;
  align-items: center;
}

@media (min-width: 1400px) {
  .filters-grid {
    grid-template-columns: 240px 240px 200px 1fr;
  }
}
@media (min-width: 1100px) and (max-width: 1399.98px) {
  .filters-grid {
    grid-template-columns: 240px 240px 200px;
  }
  .search-row {
    grid-column: 1 / -1;
  }
}
@media (min-width: 600px) and (max-width: 1099.98px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  .filters-grid > :nth-child(3) {
    grid-column: 1 / -1;
  }
  .search-row {
    grid-column: 1 / -1;
  }
}
@media (max-width: 599.98px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  .search-row {
    grid-template-columns: 1fr 52px 52px;
  }
}
</style>
