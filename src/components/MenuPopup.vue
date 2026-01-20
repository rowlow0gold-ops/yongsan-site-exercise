<template>
  <v-overlay
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    scrim="rgba(0,0,0,0.35)"
    :z-index="3000"
    content-class="menu-popup-content"
    @click:outside="$emit('update:modelValue', false)"
  >
    <v-card class="desktop-menu-card">
      <div class="desktop-menu-header">
        <div class="title">전체메뉴</div>
        <v-spacer />
        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <div class="desktop-menu-body">
        <slot />
      </div>
    </v-card>
  </v-overlay>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
});
defineEmits(["update:modelValue"]);
</script>

<!-- NOT scoped -->
<style>
/* This styles the real Vuetify overlay content container */
.menu-popup-content {
  position: fixed;
  inset: 0;
  display: block !important;
  pointer-events: none; /* allow scrim click outside */
}

/* Card must accept pointer events */

.title {
  font-size: 20px;
  font-weight: 800;
}

.desktop-menu-card {
  pointer-events: auto;
  position: fixed;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;

  /* 🔥 HEIGHT CONTROL */
  height: 70vh; /* main height */
  min-height: 420px; /* minimum visible size */
  max-height: calc(100vh - 120px);

  z-index: 3001;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
}

.desktop-menu-header {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.desktop-menu-body {
  /* 🔥 remaining space scrolls */
  height: calc(100% - 72px);
  overflow-y: auto;
  padding: 24px;
}
</style>
