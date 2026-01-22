<template>
  <v-sheet class="util-bar d-none d-md-flex" height="44">
    <v-container class="bar-inner d-flex align-center flex-nowrap py-0">
      <div class="util-links">
        <a href="#">용산구청</a><span class="sep">|</span> <a href="#">보건소</a
        ><span class="sep">|</span> <a href="#">열린구청장실</a
        ><span class="sep">|</span> <a href="#">부서·동</a
        ><span class="sep">|</span> <a href="#">교육포털</a
        ><span class="sep">|</span> <a href="#">자치회관</a
        ><span class="sep">|</span>
        <a href="#">구의회</a>
      </div>

      <v-spacer />

      <div class="util-actions">
        <v-btn variant="text" class="util-btn" prepend-icon="mdi-account"
          >로그인</v-btn
        >
        <v-btn variant="text" class="util-btn" prepend-icon="mdi-account-plus"
          >회원가입</v-btn
        >
        <v-btn variant="text" class="util-btn" prepend-icon="mdi-earth"
          >Language</v-btn
        >
      </div>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
}
@media (min-width: 960px) {
  .bar-inner {
    padding: 0 40px;
  }
}

.util-bar {
  color: #fff;
  background-color: #2f5597 !important;
}

.util-links a,
.util-actions .util-btn {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.util-links {
  display: flex;
  gap: 10px;
  align-items: center;
  white-space: nowrap;
}

.sep {
  opacity: 0.6;
}

.util-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0px 14px;
  border-radius: 999px;
  background: #fff;
}

.util-btn {
  text-transform: none;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.2px;
  color: #111 !important;
  min-width: auto !important;
  padding: 0 8px !important;
}
</style>
