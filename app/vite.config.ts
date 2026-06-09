import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/japan-visa-map/",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "cobertura"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/i18n.ts", "src/test-setup.ts", "src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
    },
  },
})
