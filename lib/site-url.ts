export function getSiteUrl() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000'

  url = url.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }
  return url.replace(/\/+$/, '')
}

// Auth emails must link back to the exact domain the person is using, so the
// sign-in cookie from signup is present when the link opens. Derive the URL
// from the incoming request instead of env config, which can drift from the
// live domain (e.g. vercel.app instead of the custom domain).
export async function getSiteUrlFromHeaders() {
  const { headers } = await import('next/headers')
  const h = await headers()
  const forwardedHost = h.get('x-forwarded-host')
  const host = (forwardedHost || h.get('host') || '').split(',')[0].trim()
  if (!/^[a-zA-Z0-9.-]+(:\d+)?$/.test(host)) return getSiteUrl()
  const forwardedProto = h.get('x-forwarded-proto')?.split(',')[0].trim()
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  const proto = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : isLocal ? 'http' : 'https'
  return `${proto}://${host}`
}

export function safeNext(value: string | null | undefined, fallback = '/app') {
  if (!value) return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//')) return fallback
  return value
}
