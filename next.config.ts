import type { NextConfig } from 'next'

// This app makes network connections to the MORT Supabase project and to
// Google Fonts (app/globals.css imports Plus Jakarta Sans from
// fonts.googleapis.com, whose stylesheet points at fonts.gstatic.com) --
// verified by grepping lib/, components/, and app/ for external URLs
// before writing this policy. No CDN, no next/image remote domains, no
// analytics, no other third-party embeds. script-src/style-src keep
// 'unsafe-inline' because Next's App Router hydration and RSC payload
// scripts are not nonce-signed by this static header config; that is a
// real, evidence-based limitation, not an oversight -- tightening further
// would need Next's per-request nonce middleware, verified against a live
// deploy before shipping, per the "don't deploy a CSP that breaks required
// functionality" standard.
// 'wasm-unsafe-eval' is required for @react-three/rapier's physics engine
// (compiled to WebAssembly) used by the homepage's animated scene
// (components/mort/scene/) -- found via a live Lighthouse run showing a
// WebAssembly.instantiate() CSP violation and ~8.6s of blocked main-thread
// script evaluation on first load before this was added. It is narrower
// than 'unsafe-eval': it permits only WASM module instantiation, not
// arbitrary string-to-code eval() of JavaScript.
const SUPABASE_ORIGIN = 'https://rakjydmgwwgtdislanbt.supabase.co'
const GOOGLE_FONTS_STYLESHEET_ORIGIN = 'https://fonts.googleapis.com'
const GOOGLE_FONTS_FILE_ORIGIN = 'https://fonts.gstatic.com'
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  `style-src 'self' 'unsafe-inline' ${GOOGLE_FONTS_STYLESHEET_ORIGIN}`,
  "img-src 'self' data: blob:",
  `font-src 'self' data: ${GOOGLE_FONTS_FILE_ORIGIN}`,
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
