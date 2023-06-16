module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true, // Added this to cover the main process in Electron.
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh', 'react-hooks'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Enforces React Hook rules.
    'react-hooks/exhaustive-deps': 'warn', // Checks for dependencies in useEffect and similar hooks.
  },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' }, // Needed for Electron.
  overrides: [
    {
      files: ['*.js'],
      rules: {
        // ESLint rules for main process can go here.
      },
    },
    {
      files: ['*.jsx', '*.tsx'],
      rules: {
        // ESLint rules for renderer process can go here.
      },
    },
  ],
};
