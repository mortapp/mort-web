import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

// /app/* is the authenticated product surface (force-dynamic, gated by
// requireUser/requireRole) and /auth/* are OAuth/session-callback routes --
// neither is meaningful or safe to index. Everything else under this file
// is the genuinely public marketing/legal/auth-entry surface.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/auth/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
