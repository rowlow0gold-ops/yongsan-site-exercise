import { computed, watchEffect, onUnmounted } from "vue";

const SITE_NAME = "minhojan-world";
const BASE_URL = "https://yongsan.minhojan-world.site";
const DEFAULT_DESC = "용산구 홈페이지 클론 프로젝트 — Vue 3 + Vuetify 3 + Spring Boot 4";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Lightweight SEO composable — no external library needed.
 * Sets document.title + meta tags reactively.
 */
export function useSeo({ title, description, path = "/", image } = {}) {
  const resolvedTitle = computed(() => {
    const t = typeof title === "object" && title !== null ? title.value : title;
    return t ? `${t} | ${SITE_NAME}` : SITE_NAME;
  });

  const resolvedDesc = computed(() => {
    const d = typeof description === "object" && description !== null ? description.value : description;
    return d || DEFAULT_DESC;
  });

  const resolvedUrl = computed(() => {
    const p = typeof path === "object" && path !== null ? path.value : path;
    return `${BASE_URL}${p}`;
  });

  const resolvedImage = computed(() => image || DEFAULT_IMAGE);

  watchEffect(() => {
    document.title = resolvedTitle.value;
    setMeta("name", "description", resolvedDesc.value);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:title", resolvedTitle.value);
    setMeta("property", "og:description", resolvedDesc.value);
    setMeta("property", "og:url", resolvedUrl.value);
    setMeta("property", "og:image", resolvedImage.value);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", resolvedTitle.value);
    setMeta("name", "twitter:description", resolvedDesc.value);
    setMeta("name", "twitter:image", resolvedImage.value);
  });
}
