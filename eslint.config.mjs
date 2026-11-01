import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'mort-2.0-slice-1/**'],
  },
]

export default eslintConfig
