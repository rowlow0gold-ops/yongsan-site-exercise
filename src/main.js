import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import "./style.css";

import pinia from "@/plugins/pinia";

createApp(App).use(pinia).use(router).use(vuetify).mount("#app");
