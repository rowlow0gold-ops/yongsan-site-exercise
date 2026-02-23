import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import "./style.css";

createApp(App).use(router).use(vuetify).use(createPinia()).mount("#app");
