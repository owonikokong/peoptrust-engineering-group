// Prettier config: matches the style the codebase already uses — double
// quotes, semicolons, 2-space indent, trailing commas in multiline
// literals, parenthesised single-argument arrows. Everything else is the
// Prettier default (print width 80). See .prettierignore for exclusions.

/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  arrowParens: "always",
};

export default config;
