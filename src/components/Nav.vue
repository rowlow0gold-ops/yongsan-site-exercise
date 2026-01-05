<template>
  <v-app-bar flat height="64" color="white" class="nav">
    <v-container class="nav-inner d-flex align-center flex-nowrap py-0">
      <!-- LEFT: Logo (absolute priority, never shrinks) -->
      <v-btn
        variant="text"
        class="mr-4 flex-shrink-0 logo-btn"
        :ripple="false"
        @click="goHome"
      >
        <v-img :src="logoUrl" height="52" contain class="logo" />
      </v-btn>
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
  max-height: 52px;
  width: auto;
  min-width: 104px;
}

.logo-btn {
  padding: 0 !important;
  min-width: unset !important;
  height: auto !important;
  line-height: normal !important;
  display: flex;
  align-items: center;
}

.square-btn {
  width: 48px;
  height: 48px;
  min-width: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
}

.nav-inner {
  max-width: 1440px; /* adjust to match the site (1280~1440 common) */
  margin: 0 auto; /* centers the whole header content */
  padding: 0 16px; /* mobile inset */
}

@media (min-width: 960px) {
  .nav-inner {
    padding: 0 40px; /* desktop inset like screenshot #1 */
  }
}
</style>
