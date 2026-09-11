import type { NextConfig } from 'next'

// This app makes exactly one external network connection (the MORT Supabase
// project) and uses no CDN, no next/image remote domains, no analytics, and
// no third-party embeds -- verified by grepping lib/, components/, and app/
// for external URLs before writing this policy. script-src/style-src keep
// 'unsafe-inline' because Next's App Router hydration and RSC payload
// scripts are not nonce-signed by this static header config; that is a
// real, evidence-based limitation, not an oversight -- tightening further
// would need Next's per-request nonce middleware, verified against a live
// deploy before shipping, per the "don't deploy a CSP that breaks required
// functionality" standard.
const SUPABASE_ORIGIN = 'https://rakjydmgwwgtdislanbt.supabase.co'
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
