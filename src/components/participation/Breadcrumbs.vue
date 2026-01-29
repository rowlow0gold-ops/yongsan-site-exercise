<template>
  <v-breadcrumbs :items="normalized" class="">
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
