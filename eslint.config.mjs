import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '**/*.d.mts', 'mort-website-nextjs/mort-site/**'],
  },
]

export default eslintConfig
