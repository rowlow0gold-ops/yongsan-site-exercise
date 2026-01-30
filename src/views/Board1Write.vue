<template>
  <Breadcrumbs :items="breadcrumbs" />

  <v-alert type="info" variant="outlined" class="mb-6">
    Your post may be visible to others. Do not include sensitive personal
    information.
  </v-alert>

  <v-card variant="outlined">
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-row class="align-center">
          <v-col cols="12" md="2" class="text-grey-darken-1">작성자</v-col>
          <v-col cols="12" md="10">{{ author }}</v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">
            공개여부 <span class="text-red">*</span>
          </v-col>
          <v-col cols="12" md="10">
            <v-radio-group v-model="visibility" inline>
              <v-radio label="공개" value="PUBLIC" />
              <v-radio label="비공개" value="PRIVATE" />
            </v-radio-group>
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">연락처</v-col>
          <v-col cols="12" md="10">
            <div class="d-flex ga-2" style="max-width: 420px">
              <v-select
                v-model="phone1"
                :items="phonePrefixes"
                density="compact"
                variant="outlined"
                style="max-width: 110px"
              />
              <v-text-field
                v-model="phone2"
                density="compact"
                variant="outlined"
                placeholder="0000"
                maxlength="4"
              />
              <v-text-field
                v-model="phone3"
                density="compact"
                variant="outlined"
                placeholder="0000"
                maxlength="4"
              />
            </div>
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">이메일</v-col>
          <v-col cols="12" md="10">
            <div class="d-flex ga-2" style="max-width: 620px">
              <v-text-field
                v-model="emailId"
                density="compact"
                variant="outlined"
                placeholder="id"
              />
              <div class="d-flex align-center">@</div>
              <v-text-field
                v-model="emailDomain"
                density="compact"
                variant="outlined"
                placeholder="domain.com"
                :disabled="emailDomainMode !== 'custom'"
              />
              <v-select
                v-model="emailDomainMode"
                :items="emailDomainOptions"
                density="compact"
                variant="outlined"
                style="max-width: 200px"
                @update:modelValue="onEmailDomainModeChange"
              />
            </div>
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">
            제목 <span class="text-red">*</span>
          </v-col>
          <v-col cols="12" md="10">
            <v-text-field
              v-model="title"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">
            내용 <span class="text-red">*</span>
          </v-col>
          <v-col cols="12" md="10">
            <v-textarea
              v-model="content"
              variant="outlined"
              :rules="[rules.required]"
              rows="10"
              auto-grow
              required
            />
          </v-col>

          <v-col cols="12" md="2" class="text-grey-darken-1">첨부파일</v-col>
          <v-col cols="12" md="10">
            <v-file-input
              v-model="files"
              variant="outlined"
              density="compact"
              multiple
              show-size
              prepend-icon="mdi-paperclip"
              hint="Up to 500MB (example)"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="12">
            <v-divider class="my-4" />

            <v-card variant="flat" class="pa-3 bg-grey-lighten-4">
              <div class="text-subtitle-2 mb-2">
                개인정보 수집·이용 안내 (example section)
              </div>

              <v-table density="compact">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>필수항목</th>
                    <th>선택항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>수집·이용할 개인정보 대상</td>
                    <td>이름, 전화번호</td>
                    <td>이메일</td>
                  </tr>
                </tbody>
              </v-table>

              <v-checkbox
                v-model="agree"
                label="동의"
                class="mt-2"
                :rules="[rules.mustAgree]"
              />
            </v-card>
          </v-col>

          <v-col cols="12" class="d-flex justify-end ga-2 mt-4">
            <v-btn variant="outlined" @click="goList">목록</v-btn>
            <v-btn color="primary" type="submit">등록</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Breadcrumbs from "@/components/participation/Breadcrumbs.vue";

const router = useRouter();

const breadcrumbs = [
  { title: "HOME", to: "/" },
  { title: "참여소통" },
  { title: "구민의견/참여" },
  { title: "칭찬합시다", disabled: true },
];

const author = ref("JANG");
const visibility = ref("PUBLIC");

const phonePrefixes = ["010", "011", "016", "017", "018", "019"];
const phone1 = ref("010");
const phone2 = ref("");
const phone3 = ref("");

const emailId = ref("");
const emailDomain = ref("");
const emailDomainMode = ref("custom");
const emailDomainOptions = [
  { title: "직접입력", value: "custom" },
  { title: "gmail.com", value: "gmail.com" },
  { title: "naver.com", value: "naver.com" },
  { title: "daum.net", value: "daum.net" },
];

const title = ref("");
const content = ref("");
const files = ref([]);
const agree = ref(false);

const formRef = ref(null);

const rules = {
  required: (v) => !!v || "Required",
  mustAgree: (v) => v === true || "You must agree",
};

function onEmailDomainModeChange(mode) {
  if (mode === "custom") {
    emailDomain.value = "";
  } else {
    emailDomain.value = mode;
  }
}

const goList = () => {
  router.replace('/board1')
}

async function onSubmit() {
  const form = formRef.value;
  if (!form) return;

  const { valid } = await form.validate();
  if (!valid) return;

  const payload = {
    author: author.value,
    visibility: visibility.value,
    phone: [phone1.value, phone2.value, phone3.value].filter(Boolean).join("-"),
    email:
      emailId.value && emailDomain.value
        ? `${emailId.value}@${emailDomain.value}`
        : "",
    title: title.value,
    content: content.value,
    agree: agree.value,
    files: files.value,
  };

  // TODO: call your API here
  console.log("submit payload:", payload);

  // After success:
  goList();
}
</script>
