// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/fonts", "@nuxt/icon"],

  colorMode: {
    preference: "light",
    fallback: "light",
  },

  runtimeConfig: {
    apiUrl: process.env.API_URL || "http://localhost:3002/api",
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    },
  },

  css: ["~/assets/css/main.css"],

  fonts: {
    families: [
      {
        name: "Plus Jakarta Sans",
        provider: "google",
        weights: [400, 500, 600, 700, 800],
        styles: ["normal", "italic"],
      },
    ],
  },

  icon: {
    serverBundle: "remote",
  },
});
