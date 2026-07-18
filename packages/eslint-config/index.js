import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// The generic strict core proven in the source repos. Deliberately absent
// (repo choices to layer on top): framework plugins (React/a11y/testing),
// ignores, browser globals, tsconfigRootDir. projectService ships ON —
// strictTypeChecked errors without type information otherwise.
const scopeToTs = (configs) =>
  configs.map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] }));

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2024 },
    },
  },
  ...scopeToTs(tseslint.configs.strictTypeChecked),
  ...scopeToTs(tseslint.configs.stylisticTypeChecked),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'max-len': ['error', { code: 80, ignoreUrls: true, ignoreStrings: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
