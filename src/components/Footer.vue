<template>
  <v-footer class="ys-footer" padless>
    <v-container class="py-0 v-container-wrapper" fluid>
      <!-- TOP: selector bars -->
      <div class="top-selects">
        <v-container class="py-0 v-container-class" fluid>
          <v-row class="ma-0" dense>
            <v-col cols="12" md="3" class="pa-0">
              <div class="select-bar">
                <span class="label">부서</span>
                <v-spacer />
                <v-icon size="20" icon="mdi-chevron-up" />
                <div class="go">이동</div>
              </div>
            </v-col>

            <v-col cols="12" md="3" class="pa-0">
              <div class="select-bar">
                <span class="label">동주민센터</span>
                <v-spacer />
                <v-icon size="20" icon="mdi-chevron-up" />
                <div class="go">이동</div>
              </div>
            </v-col>

            <v-col cols="12" md="3" class="pa-0">
              <div class="select-bar">
                <span class="label">관내 주요기관 / 시 · 도</span>
                <v-spacer />
                <v-icon size="20" icon="mdi-chevron-up" />
                <div class="go">이동</div>
              </div>
            </v-col>

            <v-col cols="12" md="3" class="pa-0">
              <div class="select-bar">
                <span class="label">서울시 / 자치구</span>
                <v-spacer />
                <v-icon size="20" icon="mdi-chevron-up" />
                <div class="go">이동</div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- LINKS -->
      <v-container class="links-wrap" fluid>
        <div class="links">
          <a href="#" class="link accent">개인정보처리방침</a>
          <a href="#" class="link">영상정보처리기기 운영 · 관리 방침</a>
          <a href="#" class="link">저작권정책</a>
          <a href="#" class="link">맞춤형 구독정보(RSS)</a>
          <a href="#" class="link">전자우편 수집거부</a>
          <a href="#" class="link">찾아오시는길</a>
        </div>
      </v-container>

      <div class="divider" />

      <!-- ADDRESS ROW -->
      <v-container class="address-wrap" fluid>
        <div class="address-row">
          <!-- left logo -->
          <div class="brand">
            <v-img
              class="brand-logo"
              :src="logoFoot"
              width="190"
              height="40"
              contain
              alt="미래도시 용산"
            />
          </div>

          <!-- center address -->
          <div class="address">
            <div class="addr-line">
              대표전화 <b class="tel">02</b>-2199-6114(120다산 콜센터로
              연결)야간, 공휴일/당직실 02-2199-6300(FAX:02-2199-5300)
            </div>
            <div class="addr-line">
              04390 서울특별시 용산구 녹사평대로 150(이태원동)
            </div>
          </div>

          <!-- right icons -->
          <div class="marks">
            <v-img
              :src="flag"
              width="90"
              height="56"
              contain
              alt="태극기"
              class="mark"
            />
            <v-img
              :src="privacy"
              width="90"
              height="56"
              contain
              alt="개인정보"
              class="mark"
            />
            <v-img
              :src="wa"
              width="90"
              height="56"
              contain
              alt="WA"
              class="mark"
            />
          </div>
        </div>
      </v-container>

      <div class="divider" />

      <!-- NOTICE ROW -->
      <v-container class="notice-wrap" fluid>
        <div class="notice-row">
          <v-img
            class="notice-logo"
            :src="logoTrans"
            width="115"
            height="33"
            contain
            alt="용산 로고"
          />
          <div class="notice-text">이 누리집은 용산구청 누리집입니다.</div>
        </div>
      </v-container>
    </v-container>
  </v-footer>
</template>

<script setup>
import logoFoot from "../assets/logo-foot.svg";
import logoTrans from "../assets/logo-trans.png";

import flag from "../assets/flag.png";
import privacy from "../assets/foot-privacy.png";
import wa from "../assets/logo_wa.png";
</script>

<style scoped>
.ys-footer {
  background: #3f464f; /* screenshot 느낌 */
  color: rgba(255, 255, 255, 0.92);
}

/* TOP selects */
.top-selects {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.select-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: #3f464f;
}
.select-bar .label {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.92;
}
.select-bar .go {
  margin-left: 14px;
  padding: 0 18px;
  height: 64px;
  display: flex;
  align-items: center;
  background: #505a66;
  font-weight: 700;
}
@media (max-width: 959px) {
  .select-bar {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .select-bar .go {
    height: 64px;
  }
}

/* links */
.links-wrap {
  padding: 18px 18px;
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  align-items: center;
}
.link {
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}
.link:hover {
  text-decoration: underline;
}
.link.accent {
  color: #ff5aa5; /* 개인정보처리방침 핑크 느낌 */
}

/* dividers */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

/* address row */
.address-wrap {
  padding: 22px 18px;
}
.address-row {
  display: grid;
  grid-template-columns: 220px 1fr auto;
  gap: 18px;
  align-items: center;
}
.brand-logo {
  opacity: 0.9;
}
.address {
  font-size: 16px;
  line-height: 1.7;
  opacity: 0.92;
}
.tel {
  color: #ffea00; /* “02” 강조 느낌 */
}
.marks {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: flex-end;
}

/* notice */
.notice-wrap {
  padding: 10px 18px 10px;
}
.notice-row {
  display: flex;
  gap: 14px;
  flex-wrap: nowrap; /* ✅ 줄바꿈 방지 */
}
.notice-text {
  font-size: 18px;
  font-weight: 700;
  opacity: 0.92;
}

.notice-logo {
  display: inline-block; /* don’t act like a full-width block */
  flex: 0 0 auto; /* don’t grow, don’t shrink */
  max-width: 115px; /* hard limit */
  filter: grayscale(100%);
}

.v-container-class {
  padding: 0px !important;
}

.v-container-wrapper {
  max-width: 1400px;
}

@media (max-width: 959px) {
  .links-wrap {
    padding: 18px 16px;
  }
  .links {
    justify-content: center; /* 모바일 링크 가운데 */
    text-align: center;
    gap: 16px 22px;
  }

  .address-row {
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: start;
  }

  .marks {
    justify-content: flex-start; /* 모바일에서는 주소 아래쪽 왼쪽 */
  }

  .notice-row {
    gap: 12px;
  }
}
</style>
