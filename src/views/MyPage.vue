<script setup>
import { ref, onMounted } from "vue";
import { meApi } from "@/api/auth";
import { useSeo } from "@/composables/useSeo";
useSeo({ title: "마이페이지", description: "내 정보 확인", path: "/mypage" });

const loading = ref(true);
const user = ref(null);
const error = ref(null);

onMounted(async () => {
  try {
    const { data } = await meApi();
    user.value = data;
  } catch (e) {
    error.value = "Failed to load user info.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="mypage">
    <h2>My Page</h2>

    <div v-if="loading">Loading...</div>

    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
    </div>
  </div>
</template>

<style scoped>
.mypage {
  padding: 20px;
}
</style>