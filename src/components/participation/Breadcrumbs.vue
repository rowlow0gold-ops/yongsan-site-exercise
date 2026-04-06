<template>
  <v-breadcrumbs :items="normalized" class="breadcrumbs-wrap">
    <template #divider>
      <v-icon size="14">mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: { type: Array, required: true, default: () => [] },
});

const normalized = computed(() =>
  (props.items || []).map((it) => ({
    title: it.title ?? it.label ?? "",
    to: it.to, // if you use router links
    href: it.href, // if you use normal links
    disabled: it.disabled ?? false,
  })),
);
</script>

<style scoped>
.breadcrumbs-wrap {
  flex-wrap: wrap;
  padding: 8px 16px;
  font-size: 13px;
}

@media (max-width: 600px) {
  .breadcrumbs-wrap {
    padding: 6px 8px;
    font-size: 12px;
  }
  .breadcrumbs-wrap :deep(.v-breadcrumbs-item) {
    padding: 0 2px;
  }
}
</style>
