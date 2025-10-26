import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5101,
    strictPort: true,
    proxy: {
      "/api": {                
        target: "http://localhost:5000",
        changeOrigin: true
      },
      "/users": {              
        target: "http://localhost:5100",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/users/, "/users")
      },
      "/reviews": {            
        target: "http://localhost:5100",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/reviews/, "/reviews")
      }
    }
  }
});
