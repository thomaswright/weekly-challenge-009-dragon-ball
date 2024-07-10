import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://thomaswright.github.io/weekly-challenge-009-dragon-ball/",
  plugins: [
    react({
      include: ["**/*.res.mjs"],
    }),
  ],
});
