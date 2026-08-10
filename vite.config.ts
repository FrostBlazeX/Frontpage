import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { apiDevMiddleware } from "./vite-plugins/apiDevMiddleware.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevMiddleware()],
});
