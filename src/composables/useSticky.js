import { ref, onMounted } from "vue";

const isSticky = ref(false);
let listening = false;
let ticking = false;

const STICKY_ON = 80; // choose your threshold
const STICKY_OFF = 68; // slightly lower to prevent flicker

function apply(y) {
  if (!isSticky.value && y > STICKY_ON) isSticky.value = true;
  else if (isSticky.value && y < STICKY_OFF) isSticky.value = false;
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    apply(window.scrollY || 0);
    ticking = false;
  });
}

export function useSticky() {
  onMounted(() => {
    if (!listening) {
      window.addEventListener("scroll", onScroll, { passive: true });
      listening = true;
      onScroll();
    }
  });

  return { isSticky };
}
