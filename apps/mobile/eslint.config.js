// https://docs.expo.dev/guides/using-eslint/
const path = require('path');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const tsconfigRootDir = path.dirname(require.resolve('./tsconfig.json'));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
]);
