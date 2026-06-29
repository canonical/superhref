import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests live next to the code (src/**); integration tests live in test/**.
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
