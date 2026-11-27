import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: [
      "apps/**/*.test.ts",
      "apps/**/*.test.tsx",
      "apps/**/*.spec.ts",
      "packages/**/*.test.ts",
      "packages/**/*.spec.ts",
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
    ],
    exclude: ["apps/keycloak-auth/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "apps/*/src/**/application/**/*.ts",
        "apps/*/src/**/domain/**/*.ts",
        "apps/identity-sync-service/src/auth/*.ts",
        "apps/identity-sync-service/src/tenants/*.ts",
        "packages/database/src/portfolio-access.ts",
        "packages/database/src/tenant-lookup.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/main.ts",
        "**/request-authentication.ts",
        "**/token-verifier.ts",
        "**/authorization-errors.ts",
        "**/guards/**",
        "**/infrastructure/**",
        "**/presentation/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
