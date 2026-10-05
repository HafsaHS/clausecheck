import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // "server-only" throws outside a React Server Components build; tests import server modules directly.
    alias: { "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)) },
  },
  test: {
    // Most tests cover server-side lib/ code; component tests opt in with `// @vitest-environment jsdom`.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
