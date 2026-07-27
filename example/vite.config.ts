import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import locator from "../dist/index.js";

export default defineConfig({
  plugins: [
    react(),
    locator(),
  ],
});