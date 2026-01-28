<template>
  <v-container fluid class="px-6 px-lg-12">
    <v-row class="gy-6 gx-6">
      <v-col cols="13" md="6">
        <div class="module-frame">
          <BannerSlider class="fill-module" />
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="module-frame">
          <LeaderSection class="fill-module" />
        </div>
      </v-col>
    </v-row>
  </v-container>
  <NewInfos />
  <MainInfos />
  <AlertBanner />
  <CommunicationChannel />
</template>
<script setup>
import BannerSlider from "@/components/BannerSlider.vue";
import LeaderSection from "@/components/LeaderSection.vue";
import MainInfos from "@/components/MainInfos.vue";
import NewInfos from "@/components/NewInfos.vue";
import AlertBanner from "@/components/AlertBanner.vue";
import CommunicationChannel from "@/components/CommunicationChannel.vue";
</script>
<style scoped>
.module-frame {
  width: 100%;
  aspect-ratio: 1040 / 450; /* ✅ same as banner images (~2.31:1) */
  max-height: 450px; /* optional */
}

.fill-module {
  width: 100%;
  height: 100%;
}
</style>
