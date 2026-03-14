import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist', 'node_modules', '*.config.mjs'],
  },
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
