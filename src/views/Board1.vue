<template>
  <v-app>
    <!-- Desktop left nav / Mobile drawer -->
    <v-navigation-drawer
      v-model="drawer"
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
            :active="route.name === 'praise'"
            @click="router.push({ name: 'praise' })"
          />
          <v-list-item title="나도한마디" />
          <v-list-item title="국민생각함" />
          <v-list-item title="공유서비스(공간,공구대여 등)" />
          <v-list-item title="대학생(청년) 아르바이트" />
          <v-list-item title="도시텃밭" />
          <v-list-item title="세무설명회" />
        </v-list>

        <v-divider class="my-3" />

        <v-list-item title="적극행정">
          <template #append>
            <v-icon size="18">mdi-chevron-down</v-icon>
          </template>
        </v-list-item>
        <v-list-item title="구민참여예산제">
          <template #append>
            <v-icon size="18">mdi-chevron-down</v-icon>
          </template>
        </v-list-item>
        <v-list-item title="마을">
          <template #append>
            <v-icon size="18">mdi-chevron-down</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar flat class="bg-grey-lighten-5" height="64">
      <v-container class="d-flex align-center ga-2 content-wrap bg-white">
        <v-btn
          v-if="!mdAndUp"
          icon
          variant="text"
          aria-label="menu"
          @click="drawer = !drawer"
        >
          <v-icon><Menu /></v-icon>
        </v-btn>

        <div class="d-flex flex-column">
          <div class="text-h6 font-weight-bold">칭찬합시다</div>
          <div class="text-caption text-medium-emphasis">
            HOME &gt; 참여소통 &gt; 구민의견/참여 &gt; 칭찬합시다
          </div>
        </div>

        <v-spacer />

        <!-- Desktop icons like share/print -->
        <v-btn icon variant="text" aria-label="share">
          <v-icon><Share2 /></v-icon>
        </v-btn>
        <v-btn icon variant="text" aria-label="print">
          <v-icon><Printer /></v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <v-container class="py-6 content-wrap">
        <!-- Filters card -->
        <v-card class="rounded-lg" elevation="1">
          <v-card-text>
            <div class="filters-grid">
              <DateField
                v-model="filters.from"
                label="시작날짜"
                :md-and-up="mdAndUp"
              />
              <DateField
                v-model="filters.to"
                label="종료날짜"
                :md-and-up="mdAndUp"
              />

              <v-select
                v-model="filters.field"
                :items="fieldItems"
                label="제목"
                variant="outlined"
                density="comfortable"
                hide-details
              />

              <div class="search-row">
                <v-text-field
                  v-model="filters.q"
                  label="검색어 입력"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
                <v-btn
                  color="primary"
                  height="44"
                  min-width="52"
                  @click="apply()"
                >
                  <v-icon icon="mdi-magnify" />
                </v-btn>
                <v-btn
                  variant="outlined"
                  height="44"
                  min-width="52"
                  @click="reset()"
                >
                  <v-icon icon="mdi-refresh" />
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <div class="d-flex align-center justify-space-between mt-6 mb-3">
          <div class="text-body-2 text-medium-emphasis">
            총
            <span class="text-primary font-weight-bold">{{ total }}</span> 건
            <span class="text-medium-emphasis"
              >({{ page }} / {{ pageCount }} 페이지)</span
            >
          </div>
          <div class="text-body-2 text-primary">
            ※ 글쓰기 기능은 로그인 후에 이용 가능하지만, 테스트 기간 중에는
            자유롭게 가능합니다.
          </div>
        </div>

        <!-- Desktop: table / Mobile: list -->
        <v-card class="rounded-lg" elevation="1">
          <v-card-text class="pa-0">
            <template v-if="mdAndUp">
              <v-data-table
                :headers="headers"
                :items="pagedItems"
                :items-per-page="perPage"
                item-value="id"
                class="praise-table"
                density="comfortable"
                hide-default-footer
              >
                <template #item.title="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="18" class="text-medium-emphasis"
                      >mdi-lock</v-icon
                    >
                    <RouterLink
                      class="text-decoration-none text-high-emphasis"
                      :to="{ name: 'praise-detail', params: { id: item.id } }"
                    >
                      {{ item.title }}
                    </RouterLink>
                  </div>
                </template>
              </v-data-table>

              <div class="d-flex justify-center py-4">
                <v-pagination
                  v-model="page"
                  :length="pageCount"
                  rounded="lg"
                  density="comfortable"
                />
              </div>
            </template>

            <template v-else>
              <div class="pa-5">
                <div v-for="item in pagedItems" :key="item.id" class="py-4">
                  <div class="d-flex align-center ga-2">
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ item.id }}
                    </div>
                    <v-icon size="18" class="text-medium-emphasis"
                      >mdi-lock</v-icon
                    >
                    <RouterLink
                      class="text-decoration-none text-high-emphasis"
                      :to="{ name: 'praise-detail', params: { id: item.id } }"
                    >
                      {{ item.title }}
                    </RouterLink>
                  </div>

                  <div class="mt-3 text-body-2">
                    <div class="d-flex ga-2">
                      <span class="text-medium-emphasis" style="min-width: 64px"
                        >작성자</span
                      >
                      <span>{{ item.author }}</span>
                    </div>
                    <div class="d-flex ga-2 mt-1">
                      <span class="text-medium-emphasis" style="min-width: 64px"
                        >작성일</span
                      >
                      <span>{{ item.date }}</span>
                    </div>
                    <div class="d-flex ga-2 mt-1">
                      <span class="text-medium-emphasis" style="min-width: 64px"
                        >조회수</span
                      >
                      <span>{{ item.views }}</span>
                    </div>
                  </div>

                  <v-divider class="mt-4" />
                </div>

                <div class="d-flex justify-center py-2">
                  <v-pagination
                    v-model="page"
                    :length="pageCount"
                    rounded="lg"
                    density="comfortable"
                  />
                </div>
              </div>
            </template>

            <div class="board-actions">
              <v-btn color="primary" height="40" @click="goWrite()">
                <v-icon start icon="mdi-pencil" />
                글쓰기
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Optional satisfaction widget like your screenshot -->
        <v-card class="rounded-lg mt-10" elevation="1">
          <v-card-text>
            <div
              class="d-flex align-center ga-2 text-primary font-weight-medium"
            >
              <v-icon size="18">mdi-check-circle-outline</v-icon>
              이 페이지에서 제공하는 정보에 대하여 어느 정도 만족하셨습니까?
            </div>

            <div
              class="d-flex justify-space-between mt-4 mb-4"
              style="gap: 5px"
            >
              <v-btn
                v-for="item in [
                  '매우 만족',
                  '만족',
                  '보통',
                  '불만',
                  '매우 불만',
                ]"
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

              <v-btn color="primary" height="40" @click="submitFeedback()">
                의견등록
              </v-btn>
            </div>

            <div class="text-caption text-medium-emphasis mt-2">
              200자 이내로 입력하여 주시길 바랍니다. 만족도 조사 관련 내용 외에
              문의사항이나 민원내용은 종합민원의 민원신청을 이용해 주세요.
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useDisplay } from "vuetify";
import DateField from "@/components/DateField.vue";

// lucide icons in Vuetify v-icon
import {
  Menu,
  RefreshCw,
  Search,
  Share2,
  Printer,
  PenSquare,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const { mdAndUp } = useDisplay();

const drawer = ref(true);

const filters = reactive({
  from: "",
  to: "",
  field: "title",
  q: "",
});

const fieldItems = [
  { title: "제목", value: "title" },
  { title: "작성자", value: "author" },
];

// Demo data (replace with your API)
const items = ref([
  {
    id: 285,
    title: "주택과 남지영 주무관님을 칭찬합니다.",
    author: "이**",
    date: "2026-01-26",
    views: 2,
  },
  {
    id: 284,
    title: "여권민원과 정지원 선생님 친절하십니다",
    author: "김**",
    date: "2026-01-23",
    views: 12,
  },
  {
    id: 283,
    title: "*임대주택에 관련되어서 일하는 공무원분들... 칭찬드립니다.",
    author: "민**",
    date: "2026-01-22",
    views: 2,
  },
  {
    id: 282,
    title: "1호차 기사님 칭찬합니다.",
    author: "이**",
    date: "2026-01-19",
    views: 27,
  },
  {
    id: 281,
    title: "책임감 넘친 참 이태원동 구급대원 3분! 너무 감사합니다!",
    author: "남**",
    date: "2026-01-16",
    views: 39,
  },
  {
    id: 280,
    title: "진정한 환경미화원입니다.",
    author: "김**",
    date: "2026-01-16",
    views: 49,
  },
  {
    id: 279,
    title: "용산2가동 환경미화 아저씨들칭찬해주세요",
    author: "이**",
    date: "2026-01-15",
    views: 48,
  },
  {
    id: 278,
    title: "1호차 기사님을 칭찬합니다.",
    author: "이**",
    date: "2026-01-15",
    views: 3,
  },
  {
    id: 277,
    title: "용산2가동 야간 환경미화원 황씨 아저씨의 이야기",
    author: "김**",
    date: "2026-01-14",
    views: 52,
  },
  {
    id: 276,
    title: "재활용 쓰레기 수거해주시는 분들 감사합니다.",
    author: "송**",
    date: "2026-01-12",
    views: 4,
  },
]);

const perPage = 10;
const page = ref(1);

const headers = [
  { title: "번호", key: "id", width: 90 },
  { title: "제목", key: "title" },
  { title: "작성자", key: "author", width: 120 },
  { title: "작성일", key: "date", width: 140 },
  { title: "조회수", key: "views", width: 110 },
];

const filtered = computed(() => {
  let list = items.value.slice();

  // date range filter (YYYY-MM-DD string compare works)
  if (filters.from) list = list.filter((x) => x.date >= filters.from);
  if (filters.to) list = list.filter((x) => x.date <= filters.to);

  // query filter
  const q = filters.q?.trim();
  if (q) {
    const key = filters.field === "author" ? "author" : "title";
    list = list.filter((x) => String(x[key]).includes(q));
  }

  // Keep newest first like boards
  list.sort((a, b) => b.id - a.id);
  return list;
});

const total = computed(() => filtered.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / perPage)));

const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage;
  return filtered.value.slice(start, start + perPage);
});

function apply() {
  page.value = 1;
}

function reset() {
  filters.from = "";
  filters.to = "";
  filters.field = "title";
  filters.q = "";
  page.value = 1;
}

function goWrite() {
  // If you have auth, guard it in the route.
  router.push({ name: "praise-write" });
}

const selectedRate = ref(null);
const feedback = ref("");
function rate(label) {
  selectedRate.value = label;
  // Replace with API call
  console.log("rated:", label);
}
function submitFeedback() {
  console.log("feedback:", feedback.value);
  feedback.value = "";
}
</script>

<style scoped>
.filters-grid {
  display: grid;
  gap: 12px;
  align-items: center;
}

/* search input + buttons */
.search-row {
  display: grid;
  grid-template-columns: 1fr 52px 52px;
  gap: 12px;
  align-items: center;
}

/* 1 row (large desktop) */
@media (min-width: 1400px) {
  .filters-grid {
    grid-template-columns: 240px 240px 200px 1fr;
  }
}

/* 2 rows (mid desktop): date date title / search */
@media (min-width: 1100px) and (max-width: 1399.98px) {
  .filters-grid {
    grid-template-columns: 240px 240px 200px;
  }
  .search-row {
    grid-column: 1 / -1; /* full width second row */
  }
}

/* 3 rows (small desktop / big tablet): date date / title / search */
@media (min-width: 600px) and (max-width: 1099.98px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  /* title takes full row */
  .filters-grid > :nth-child(3) {
    grid-column: 1 / -1;
  }

  /* search takes full row */
  .search-row {
    grid-column: 1 / -1;
  }
}

@media (max-width: 599.98px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  .search-row {
    grid-template-columns: 1fr 52px 52px;
  }
}

.praise-table :deep(.v-data-table__td),
.praise-table :deep(.v-data-table__th) {
  padding-top: 14px;
  padding-bottom: 14px;
}

.content-wrap {
  max-width: 1200px; /* or 1280px to match gov sites */
  margin: 0 auto;
}

.board-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  margin-right: 12px;
}
</style>
