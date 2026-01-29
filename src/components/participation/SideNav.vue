<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    width="280"
    class="bg-white"
  >
    <div class="pa-4">
      <div class="text-h6 font-weight-bold">참여소통</div>
    </div>

    <v-list density="comfortable" nav>
      <v-list-item title="구민의견/참여" prepend-icon="mdi-account-group">
        <template #append>
          <v-icon size="18">mdi-chevron-down</v-icon>
        </template>
      </v-list-item>

      <v-list density="compact" class="pl-6">
        <v-list-item title="아이디어뱅크" />
        <v-list-item title="설문참여" />
        <v-list-item title="온라인 투표" />
        <v-list-item title="수요조사게시판" />

        <v-list-item
          title="칭찬합시다"
          :active="activeRouteName === 'board1'"
          @click="$emit('go', { name: 'board1' })"
        />
        <v-list-item
          title="나도한마디"
          :active="activeRouteName === 'board2'"
          @click="$emit('go', { name: 'board2' })"
        />

        <v-list-item title="국민생각함" />
        <v-list-item title="공유서비스(공간,공구대여 등)" />
        <v-list-item title="대학생(청년) 아르바이트" />
        <v-list-item title="도시텃밭" />
        <v-list-item title="세무설명회" />
      </v-list>

      <v-divider class="my-3" />

      <v-list-item title="적극행정">
        <template #append><v-icon size="18">mdi-chevron-down</v-icon></template>
      </v-list-item>
      <v-list-item title="구민참여예산제">
        <template #append><v-icon size="18">mdi-chevron-down</v-icon></template>
      </v-list-item>
      <v-list-item title="마을">
        <template #append><v-icon size="18">mdi-chevron-down</v-icon></template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: true },
  mdAndUp: { type: Boolean, default: true },
  activeRouteName: { type: [String, null], default: null },
});
defineEmits(["update:modelValue", "go"]);
</script>
