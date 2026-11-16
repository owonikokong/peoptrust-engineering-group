import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Global ignores. The vendored stageshow kit (app/components/stageshow)
    // is upstream-owned demo code, typed against React 18 — it is never
    // linted or reformatted here; fixes to it come from upstream. Build
    // output, dependencies and the generated Next.js type declarations
    // are not source either.
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "app/components/stageshow/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
