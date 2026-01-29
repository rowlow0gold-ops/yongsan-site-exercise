<template>
  <v-app>
    <SideNav
      v-model="drawer"
      :md-and-up="mdAndUp"
      :active-route-name="route.name"
      @go="onGo"
    />

    <TopBar :md-and-up="mdAndUp" v-model="drawer" :title="layoutTitle">
      <template #subtitle>
        <Breadcrumbs :items="breadcrumbs" />
      </template>
    </TopBar>

    <v-main class="bg-grey-lighten-5">
      <v-container class="py-6 content-wrap">
        <!-- child pages render here -->
        <router-view />
      </v-container>

      <!-- keep satisfaction always visible (as you said you reuse it) -->
      <SatisfactionSurvey class="content-wrap px-4 pb-10" />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDisplay } from "vuetify";

import SideNav from "@/components/participation/SideNav.vue";
import TopBar from "@/components/participation/TopBar.vue";
import Breadcrumbs from "@/components/participation/Breadcrumbs.vue";
import SatisfactionSurvey from "@/components/participation/SatisfactionSurvey.vue";
import Footer from "@/components/Footer.vue";

const router = useRouter();
const route = useRoute();
const { mdAndUp } = useDisplay();

const drawer = ref(true);

/**
 * If you want different title/breadcrumbs per page,
 * you can control them by route.meta in router config.
 */
const layoutTitle = computed(() => route.meta?.title || "칭찬합시다");
const breadcrumbs = computed(() => {
  return (
    route.meta?.breadcrumbs || [
      { label: "HOME" },
      { label: "참여소통" },
      { label: "구민의견/참여" },
      { label: "칭찬합시다" },
    ]
  );
});

function onGo(payload) {
  // payload: { name: 'board1' } etc
  router.push(payload);
}
</script>

<style scoped>
.content-wrap {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
