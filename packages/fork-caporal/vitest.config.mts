import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./output/coverage",
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
      exclude: [
        "**/*.test.js",
        "**/*.test.ts",
        "src/__tests__/**",
        "**/__tests__/**",
        "eslint.config.js",
        ".prettierrc.js",
        "vitest.config.mts",
      ],
    },
  },
})
