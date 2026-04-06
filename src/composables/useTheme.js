import { useTheme } from "vuetify";

export function useAppTheme() {
  const theme = useTheme();

  const isDark = () => theme.global.current.value.dark;

  function toggle() {
    const next = isDark() ? "light" : "dark";
    theme.global.name.value = next;
    localStorage.setItem("theme", next);
  }

  function init() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      theme.global.name.value = saved;
    }
  }

  return { theme, isDark, toggle, init };
}
