import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/pages/HomePage.vue";
import GamePage from "@/pages/GamePage.vue";
import GamePOC from "@/pages/GamePOC.vue";
import POC from "@/pages/poc.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/battleships",
    name: "battleships",
    component: GamePage,
  },
  {
    path: "/poc",
    name: "poc",
    component: GamePOC,
  },
  {
    path: "/test",
    name: "test",
    component: POC,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
