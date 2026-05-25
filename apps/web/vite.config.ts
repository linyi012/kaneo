import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from "../../package.json";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  base: "/",
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    host: true,
    hmr: true,
    port: 5173,
    // Same-origin /api in dev so auth cookies work (5173 vs 1337 are cross-origin).
    proxy: {
      "/api": {
        target:
          process.env.VITE_DEV_API_PROXY_TARGET ?? "http://127.0.0.1:1337",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["better-auth"],
  },
  ssr: {
    noExternal: ["better-auth"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@i18n": path.resolve(__dirname, "../../i18n"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/better-auth/, /node_modules/],
      transformMixedEsModules: true,
    },
    target: "esnext",
  },
});
