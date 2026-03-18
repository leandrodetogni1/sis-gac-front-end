// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/fonts", "@nuxt/icon"],

  css: ["~/assets/css/main.css"],

  fonts: {
    families: [
      {
        name: "Plus Jakarta Sans",
        provider: "google",
        weights: [400, 500, 600, 700],
      },
    ],
  },

  icon: {
    serverBundle: "remote",
  },
});
