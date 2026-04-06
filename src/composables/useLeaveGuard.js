import { ref, onMounted, onUnmounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";

/**
 * Composable that warns users before leaving a page with unsaved changes.
 * Covers both in-app navigation (vue-router) and browser close/refresh.
 *
 * @param {() => boolean} isDirty - function that returns true when there are unsaved changes
 * @param {string} [message="작성 중인 내용이 있습니다. 페이지를 떠나시겠습니까?"]
 */
export function useLeaveGuard(isDirty, message = "작성 중인 내용이 있습니다. 페이지를 떠나시겠습니까?") {
  const submitted = ref(false);

  /** Call this right before a successful submit so the guard is skipped */
  function markSubmitted() {
    submitted.value = true;
  }

  // Vue Router guard
  onBeforeRouteLeave(() => {
    if (submitted.value) return true;
    if (isDirty()) {
      return window.confirm(message);
    }
    return true;
  });

  // Browser close / refresh guard
  function beforeUnload(e) {
    if (submitted.value) return;
    if (isDirty()) {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  onMounted(() => window.addEventListener("beforeunload", beforeUnload));
  onUnmounted(() => window.removeEventListener("beforeunload", beforeUnload));

  return { markSubmitted };
}
