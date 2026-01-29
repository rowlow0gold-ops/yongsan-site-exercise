<template>
  <v-card class="rounded-lg mt-10 mb-10" elevation="1">
    <v-card-text>
      <div class="d-flex align-center ga-2 text-primary font-weight-medium">
        <v-icon size="18">mdi-check-circle-outline</v-icon>
        이 페이지에서 제공하는 정보에 대하여 어느 정도 만족하셨습니까?
      </div>

      <div class="d-flex justify-space-between mt-4 mb-4" style="gap: 5px">
        <v-btn
          v-for="item in rates"
          :key="item"
          :color="selectedRate === item ? 'blue' : 'default'"
          :variant="selectedRate === item ? 'flat' : 'tonal'"
          class="flex-1-1"
          @click="rate(item)"
        >
          {{ item }}
        </v-btn>
      </div>

      <div class="d-flex align-end ga-2">
        <v-text-field
          v-model="feedback"
          placeholder="의견을 입력해주세요.."
          variant="outlined"
          density="compact"
          hide-details
        />
        <v-btn color="primary" height="40" @click="submitFeedback">
          의견등록
        </v-btn>
      </div>

      <div class="text-caption text-medium-emphasis mt-2">
        200자 이내로 입력하여 주시길 바랍니다. 만족도 조사 관련 내용 외에
        문의사항이나 민원내용은 종합민원의 민원신청을 이용해 주세요.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useAlert } from "@/composables/useAlert";

const { open } = useAlert();

const rates = ["매우 만족", "만족", "보통", "불만", "매우 불만"];
const selectedRate = ref(null);
const feedback = ref("");

function rate(label) {
  selectedRate.value = label;
  console.log("rated:", label);
}

function submitFeedback() {
  if (feedback.value === "" && selectedRate.value === null) {
    open("의견을 입력해주세요.", "warning");
    return;
  }
  open("의견이 등록되었습니다", "success");
  feedback.value = "";
  selectedRate.value = null;
}
</script>
