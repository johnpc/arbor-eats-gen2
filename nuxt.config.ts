// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  pages: true,
  modules: ["nuxt-icon", "@pinia/nuxt", "@vite-pwa/nuxt"],
  nitro: {
    prerender: {
      routes: [],
      failOnError: false,
    },
  },
  runtimeConfig: {
    public: {
      bucketUrl: process.env.BUCKET_URL,
      webNotificationPublicKey: process.env.WEB_NOTIFICATION_PUBLIC_KEY,
    },
  },
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  pwa: {
    strategies: "injectManifest",
    manifest: {
      name: "Arbor Eats",
      short_name: "Arbor Eats",
      description: "Your friends are meal prepping. Get in on it!",
      theme_color: "#000000",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
    workbox: {
      // Only precache these files - html should be excluded
      globPatterns: ["**/*.{js,css}"],

      // Don't fallback on document based (e.g. `/some-page`) requests
      // Even though this says `null` by default, I had to set this specifically to `null` to make it work
      navigateFallback: null,
    },
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    },
  },
});
