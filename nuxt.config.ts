import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["shadcn-nuxt", "@logto/nuxt", "nuxt-auth-utils", "nuxt-icon"],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    logto: {
      endpoint: process.env.LOGTO_ENDPOINT,
      appId: process.env.LOGTO_APP_ID,
      appSecret: process.env.LOGTO_APP_SECRET,
      cookieEncryptionKey: process.env.LOGTO_COOKIE_ENCRYPTION_KEY,
      pathnames: {
        signIn: "/login",
        signOut: "/logout",
        callback: "/callback",
      },
      scopes: ["openid", "profile", "email"],
      fetchUserInfo: true,
    },
  },
  plugins: [
    '~/plugins/supabase.client.ts',
  ],

  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
});
