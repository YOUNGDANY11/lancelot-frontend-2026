import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: 'Usa el apiClient de src/lib desde un servicio.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/views/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: 'Las vistas y componentes consumen controladores, no HTTP.',
            },
          ],
          patterns: [
            {
              group: ['@/services/*', '@/lib/apiClient'],
              message: 'Las vistas y componentes consumen controladores, no servicios.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/lib/apiClient.ts',
      'src/utils/parseApiError.ts',
      'src/test/**/*.{ts,tsx}',
      'src/**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.tsx', 'src/test/**/*.tsx', 'src/**/*.test.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettierConfig,
])
