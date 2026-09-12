import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

// Only the genuinely public, indexable marketing/legal/auth-entry routes.
// /app/* and /auth/* are excluded here (and in robots.ts) because they are
// authenticated or session-callback surfaces, not public content.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const routes = ['/', '/safety', '/legal/terms', '/legal/privacy', '/signup', '/login']
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }))
}
