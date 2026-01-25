-- Billing Status View
-- Convenient view for frontend to get complete billing status in one query

CREATE VIEW public.v_billing_status AS
SELECT
  e.user_id,
  e.feature_key,
  e.access,
  e.is_active,
  e.expires_at,
  -- Default to 3 remaining trials for users without trial records (legacy users)
  COALESCE(t.trial_limit - t.trial_used, 3) AS trial_remaining,
  COALESCE(t.trial_limit, 3) AS trial_limit,
  COALESCE(t.trial_used, 0) AS trial_used,
  -- Computed field: can user use the feature?
  CASE 
    WHEN e.is_active = true AND e.access = 'lifetime' THEN true
    WHEN e.is_active = true AND e.access = 'subscription' AND e.expires_at > now() THEN true
    WHEN COALESCE(t.trial_used, 0) < COALESCE(t.trial_limit, 3) THEN true
    ELSE false
  END AS can_use
FROM public.billing_entitlements e
LEFT JOIN public.billing_trials t
  ON t.user_id = e.user_id AND t.feature_key = e.feature_key;

-- Note: Views inherit RLS from underlying tables
-- Users can only see their own billing_entitlements and billing_trials rows

COMMENT ON VIEW public.v_billing_status IS 'Unified billing status view. can_use indicates if user has access to the feature. Defaults to 3 trials for legacy users.';
