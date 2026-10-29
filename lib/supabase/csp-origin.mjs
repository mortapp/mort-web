const PRODUCTION_SUPABASE_ORIGIN = 'https://jxbnrkasktbhtiujkhay.supabase.co'
const SUPABASE_HOST_PATTERN = /^[a-z0-9][a-z0-9-]*\.supabase\.co$/i

export function getSupabaseOrigin(configuredUrl, deploymentEnvironment) {
  const candidate = configuredUrl?.trim() || PRODUCTION_SUPABASE_ORIGIN
  let parsed

  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS Supabase project URL')
  }

  if (
    parsed.protocol !== 'https:' ||
    !SUPABASE_HOST_PATTERN.test(parsed.hostname) ||
    parsed.username ||
    parsed.password ||
    (parsed.port && parsed.port !== '443') ||
    (parsed.pathname !== '' && parsed.pathname !== '/') ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS Supabase project URL')
  }

  if (deploymentEnvironment === 'production' && parsed.origin !== PRODUCTION_SUPABASE_ORIGIN) {
    throw new Error('Production Supabase origin must be https://jxbnrkasktbhtiujkhay.supabase.co')
  }

  return parsed.origin
}
