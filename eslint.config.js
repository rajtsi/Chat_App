import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    // 1. Tell ESLint to completely ignore these folders globally
    globalIgnores([
        '**/dist/**',
        '**/node_modules/**',
        '**/build/**'
    ]),

    {
        // 2. Only apply these React/JS rules to files inside your frontend folder
        // (Replace 'frontend' with your actual folder name if it's called 'client', 'app', etc.)
        files: ['frontend/**/*. {js,jsx}'],

        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        rules: {
            // 3. Your spacing fix!
            "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }]
        },
    },
])