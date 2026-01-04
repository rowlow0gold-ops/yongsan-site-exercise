<template>
  <v-app-bar flat height="64" color="white" class="nav">
    <v-container fluid class="d-flex align-center flex-nowrap py-0 px-0">
      <!-- LEFT: Logo (absolute priority, never shrinks) -->
      <v-img
        :src="logoUrl"
        height="40"
        contain
        class="mr-4 flex-shrink-0 logo"
      />

      <v-spacer />

      <!-- RIGHT: Big search box (hide first on small screens) -->
      <v-sheet
        class="mr-3 d-none d-lg-flex"
        width="240"
        height="36"
        rounded="lg"
        variant="outlined"
      />

      <!-- Optional placeholders (hide on mobile) -->
      <v-sheet
        class="mr-3 d-none d-md-flex"
        width="36"
        height="36"
        rounded="lg"
        variant="outlined"
      />
      <v-sheet
        class="mr-3 d-none d-md-flex"
        width="36"
        height="36"
        rounded="lg"
        variant="outlined"
      />

      <!-- Icons: always visible -->
      <v-btn variant="flat" color="#de3a75" rounded="0" class="square-btn">
        <v-icon icon="mdi-magnify" />
      </v-btn>
      <v-btn variant="flat" color="#711298" rounded="0" class="mr-4 square-btn">
        <v-icon icon="mdi-menu" />
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import logoUrl from "../assets/bi-new.jpg";
</script>

<style scoped>
.nav {
  position: relative;
  z-index: 10;
}

.nav::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 8px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
}

.logo {
  max-height: 56px;
  min-width: 56px;
  width: 56px;
}

.square-btn {
  width: 48px;
  height: 48px;
  min-width: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
}
</style>
