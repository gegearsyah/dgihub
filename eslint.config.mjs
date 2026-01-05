// ESLint 9 flat config for Next.js
// Note: eslint-config-next may not fully support flat config yet
// This is a minimal config that works with ESLint 9

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.mjs",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Basic rules - Next.js specific rules will be handled by next/core-web-vitals
      // For now, we'll use a minimal config until eslint-config-next fully supports flat config
    },
  },
];

