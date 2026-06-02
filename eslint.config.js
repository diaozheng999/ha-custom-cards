import { FlatCompat } from '@eslint/eslintrc'
import nxPlugin from '@nx/eslint-plugin'

const compat = new FlatCompat()

export default [
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.js'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
