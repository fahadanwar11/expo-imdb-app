// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    rules: {
      // Reanimated shared values are intentionally mutable (`sv.value = ...`).
      // The React Compiler immutability heuristic flags this idiomatic API, so
      // we disable it for this Reanimated-heavy codebase.
      "react-hooks/immutability": "off",
    },
  },
]);
