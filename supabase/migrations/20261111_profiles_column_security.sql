-- Column-level security on profiles: clients can no longer update
-- trust-bearing columns (verification_status, role, account_status,
-- moderation fields, date of birth, onboarding completion) through
-- the API. Legitimate flows write these via SECURITY DEFINER RPCs and
-- staff review functions only.

revoke update on public.profiles from authenticated, anon;

grant update (
  display_name,
  username,
  avatar_path,
  bio,
  city,
  region,
  timezone,
  location_setup_mode,
  approximate_area,
  availability,
  preferred_job_categories,
  transportation_methods,
  max_travel_distance_miles,
  max_travel_minutes,
  walking_distance_only,
  guardian_transportation_possible,
  guardian_setup_status
) on public.profiles to authenticated;
