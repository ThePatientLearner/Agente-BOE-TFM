import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Los tests de esta app comprueban los datos curados de las radiografías, no
 * componentes: no hace falta jsdom ni red, así que siguen siendo instantáneos.
 *
 * El alias tiene que repetirse aquí porque vitest no lee los `paths` del
 * tsconfig por su cuenta.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules/**"],
  },
});
