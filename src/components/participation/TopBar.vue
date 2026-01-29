<template>
  <v-app-bar flat class="bg-grey-lighten-5" height="128">
    <v-container class="d-flex align-center ga-2 content-wrap bg-white">
      <v-btn
        v-if="!mdAndUp"
        icon
        variant="text"
        aria-label="menu"
        @click="$emit('update:modelValue', !modelValue)"
      >
        <v-icon><Menu /></v-icon>
      </v-btn>

      <div class="d-flex flex-column">
        <div class="text-h6 font-weight-bold">{{ pageTitle }}</div>
        <div class="text-caption text-medium-emphasis">
          <slot name="subtitle" />
        </div>
      </div>

      <v-spacer />

      <v-btn icon variant="text" aria-label="share">
        <v-icon><Share2 /></v-icon>
      </v-btn>
      <v-btn icon variant="text" aria-label="print">
        <v-icon><Printer /></v-icon>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { Menu, Share2, Printer } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const pageTitle = computed(() => route.meta?.title || "참여소통");

defineProps({
  title: { type: String, default: "" },
  mdAndUp: { type: Boolean, default: true },
  modelValue: { type: Boolean, default: true }, // drawer
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.content-wrap {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
