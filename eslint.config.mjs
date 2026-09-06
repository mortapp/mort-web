import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'qa-artifacts/**', 'test-results/**', 'playwright-report/**'],
  },
]

export default eslintConfig
