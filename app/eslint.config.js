import js from "@eslint/js"
import globals from "globals"
import reactPlugin from "eslint-plugin-react"
import tseslint from "typescript-eslint"

const vitestGlobals = {
  describe: "readonly",
  it: "readonly",
  expect: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  vi: "readonly",
}

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { react: reactPlugin },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...vitestGlobals },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
)
