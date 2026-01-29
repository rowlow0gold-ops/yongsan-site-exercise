import { ref } from "vue";

const show = ref(false);
const message = ref("");
const color = ref("success");
let timer = null; // 👈 moved here (global)

export function useAlert() {
  const open = (msg, type = "success", duration = 2500) => {
    console.trace("ALERT OPEN CALLED"); // ✅ shows exact file/line
    console.log("msg:", msg);

    message.value = msg;
    color.value = type;
    show.value = true;

    clearTimeout(timer);
    timer = setTimeout(() => {
      show.value = false;
      message.value = "";
    }, duration);
  };

  const close = () => {
    clearTimeout(timer);
    show.value = false;
    message.value = ""; // ✅ add this
  };

  return { show, message, color, open, close };
}
