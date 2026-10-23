import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".");
  return {
    plugins: [react(), tailwindcss()],
    // En développement, /api est relayé vers la passerelle (docker compose up) : même origine, pas de CORS.
    server: {
      proxy: {
        "/api": { target: env.VITE_API_PROXY ?? "http://localhost:8080", changeOrigin: true },
      },
    },
  };
});
