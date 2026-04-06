<template>
  <h1>I'm a not found</h1>
</template>

<script setup>
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "페이지를 찾을 수 없습니다", description: "요청하신 페이지를 찾을 수 없습니다.", path: "/404" });
</script>
