<template>
  <BoardPage
    boardKey="board1"
    notice="※ 칭찬합시다 게시판은 자유롭게 글쓰기가 가능합니다."
  />
</template>

<script setup>
import BoardPage from "./BoardPage.vue";
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "칭찬합시다", description: "용산구 칭찬합시다 게시판", path: "/board1" });
</script>
