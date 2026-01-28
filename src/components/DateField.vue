<template>
  <div>
    <v-text-field
      :model-value="modelValue"
      :label="label"
      variant="outlined"
      density="comfortable"
      hide-details
      readonly
      append-inner-icon="mdi-calendar"
      @click="open = true"
    />

    <v-dialog v-model="open" max-width="420">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Select Date
        </v-card-title>

        <v-card-text>
          <v-date-picker v-model="internal" @update:modelValue="pick" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="open = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  label: String,
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const internal = ref(null);

watch(
  () => props.modelValue,
  (v) => (internal.value = v ? new Date(v) : null),
);

function pick(v) {
  if (!v) return;
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  emit("update:modelValue", `${yyyy}-${mm}-${dd}`);
  open.value = false;
}
</script>
