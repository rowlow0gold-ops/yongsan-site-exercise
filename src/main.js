import { createApp } from "vue";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import "./style.css";
import pinia from "@/plugins/pinia";

const app = createApp(App);

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    app,
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
    ],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

app.use(pinia).use(router).use(vuetify).mount("#app");
