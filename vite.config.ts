import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const aiWorkerUrl = env.VITE_AI_WORKER_URL;

  return {
    plugins: [react(), cloudflare()],
    server: {
      host: true,
      port: 5101,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
        ...(aiWorkerUrl
          ? {
              "/ai": {
                target: aiWorkerUrl,
                changeOrigin: true,
                secure: true,
              },
            }
          : {}),
        "/users": {
          target: "http://localhost:5100",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/users/, "/users"),
        },
        "/reviews": {
          target: "http://localhost:5100",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/reviews/, "/reviews"),
        },
      },
    },
  };
});
