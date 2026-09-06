export type SceneProfile = 'home' | 'safety' | 'legal' | 'auth' | 'app'
export function sceneProfile(path: string): SceneProfile {
  if (path === '/app' || path.startsWith('/app/')) return 'app'
  if (path === '/safety') return 'safety'
  if (path.startsWith('/legal') || path === '/privacy' || path === '/terms') return 'legal'
  if (['/login', '/signup', '/reset-password', '/update-password'].includes(path) || path.startsWith('/auth/')) return 'auth'
  return 'home'
}
export const SCENES = {
  home: { sky: '#526578', horizon: '#b2c0c9', mist: '#a9bbc6', rain: false, intensity: 1 },
  safety: { sky: '#364653', horizon: '#91a5b2', mist: '#b5c6cb', rain: false, intensity: .9 },
  legal: { sky: '#344959', horizon: '#7f9cae', mist: '#9ab7c7', rain: true, intensity: .7 },
  auth: { sky: '#4b5b70', horizon: '#a2b6c7', mist: '#b5c8d8', rain: false, intensity: .6 },
  app: { sky: '#26313d', horizon: '#61717e', mist: '#8295a5', rain: false, intensity: .28 },
} as const
