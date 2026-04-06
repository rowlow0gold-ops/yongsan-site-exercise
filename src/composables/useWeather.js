import { ref, onMounted } from "vue";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";
const LAT = 37.5326; // 용산구 위도
const LON = 126.9906; // 용산구 경도

const weatherMap = {
  Clear: "맑음",
  Clouds: "흐림",
  Rain: "비",
  Drizzle: "이슬비",
  Thunderstorm: "뇌우",
  Snow: "눈",
  Mist: "안개",
  Fog: "안개",
  Haze: "연무",
  Dust: "먼지",
  Sand: "황사",
};

const iconMap = {
  Clear: "☀",
  Clouds: "☁",
  Rain: "🌧",
  Drizzle: "🌦",
  Thunderstorm: "⛈",
  Snow: "❄",
  Mist: "🌫",
  Fog: "🌫",
  Haze: "🌫",
  Dust: "🌫",
  Sand: "🌫",
};

// Cache in memory (shared across components)
let cached = null;
let cachedAt = 0;
const CACHE_MS = 30 * 60 * 1000; // 30 minutes

export function useWeather() {
  const temp = ref(null);
  const desc = ref("");
  const icon = ref("☀");
  const area = ref("");
  const loading = ref(true);
  const error = ref(false);

  // Air quality (미세먼지)
  const pm10 = ref(null); // 미세먼지
  const pm25 = ref(null); // 초미세먼지
  const pm10Grade = ref("보통");
  const pm25Grade = ref("보통");

  function gradeColor(grade) {
    if (grade === "좋음") return "good";
    if (grade === "보통") return "good";
    if (grade === "나쁨") return "bad";
    if (grade === "매우나쁨") return "bad";
    return "good";
  }

  function pm10ToGrade(v) {
    if (v <= 30) return "좋음";
    if (v <= 80) return "보통";
    if (v <= 150) return "나쁨";
    return "매우나쁨";
  }

  function pm25ToGrade(v) {
    if (v <= 15) return "좋음";
    if (v <= 35) return "보통";
    if (v <= 75) return "나쁨";
    return "매우나쁨";
  }

  async function fetchWeather() {
    if (!API_KEY) {
      // No API key — use fallback
      loading.value = false;
      return;
    }

    const now = Date.now();
    if (cached && now - cachedAt < CACHE_MS) {
      applyData(cached);
      return;
    }

    try {
      // Fetch weather + air quality in parallel
      const [weatherRes, airRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=kr`,
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`,
        ),
      ]);

      if (!weatherRes.ok) throw new Error("Weather API error");

      const weatherData = await weatherRes.json();
      const airData = airRes.ok ? await airRes.json() : null;

      cached = { weatherData, airData };
      cachedAt = now;

      applyData(cached);
    } catch (e) {
      console.error("Weather fetch failed:", e);
      error.value = true;
      loading.value = false;
    }
  }

  function applyData({ weatherData, airData }) {
    const main = weatherData.weather?.[0]?.main || "Clear";
    temp.value = Math.round(weatherData.main?.temp ?? 0);
    desc.value = weatherMap[main] || main;
    icon.value = iconMap[main] || "☀";
    area.value = weatherData.name || "Yongsan";

    if (airData?.list?.[0]?.components) {
      const c = airData.list[0].components;
      pm10.value = Math.round(c.pm10 ?? 0);
      pm25.value = Math.round(c.pm2_5 ?? 0);
      pm10Grade.value = pm10ToGrade(pm10.value);
      pm25Grade.value = pm25ToGrade(pm25.value);
    }

    loading.value = false;
  }

  onMounted(fetchWeather);

  return {
    temp,
    desc,
    icon,
    area,
    loading,
    error,
    pm10Grade,
    pm25Grade,
    gradeColor,
  };
}
