<template>
  <BoardPage
    boardKey="board2"
    notice="※ 나도한마디 게시판은 로그인 이후  사용이 가능합니다."
  />
</template>

<script setup>
import BoardPage from "./BoardPage.vue";
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "나도한마디", description: "용산구 나도한마디 게시판", path: "/board2" });
</script>
