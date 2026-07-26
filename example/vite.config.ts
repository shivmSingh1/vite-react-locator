import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import locator from "../dist/index.js";

console.log("✅ Vite config loaded");

export default defineConfig({
  plugins: [
    react(),
    locator(),
  ],
});