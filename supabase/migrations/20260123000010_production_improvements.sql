-- Additional improvements for production stability
-- 1. Unique constraint on profiles.stripe_customer_id
-- 2. Unique index on dream_messages.client_message_id (for idempotency)
-- 3. Backfill billing_trials for existing users

-- 1. Add unique constraint on stripe_customer_id in profiles
-- This prevents a single Stripe customer from being linked to multiple users
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_stripe_customer_id_unique 
UNIQUE (stripe_customer_id);

-- 2. Add unique index for client_message_id per user (idempotency)
-- This prevents duplicate messages from network retries or double-clicks
CREATE UNIQUE INDEX IF NOT EXISTS dream_messages_user_client_msg_unique
ON public.dream_messages(user_id, client_message_id)
WHERE client_message_id IS NOT NULL;

-- 3. Backfill billing_trials for existing users who don't have records
-- This ensures legacy users get their 3 free trials
INSERT INTO public.billing_trials (user_id, feature_key, trial_limit, trial_used)
SELECT id, 'dream_decoder', 3, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.billing_trials)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Backfill billing_entitlements for existing users who don't have records
INSERT INTO public.billing_entitlements (user_id, feature_key, access, is_active)
SELECT id, 'dream_decoder', 'free', false
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.billing_entitlements 
  WHERE feature_key = 'dream_decoder'
)
ON CONFLICT (user_id, feature_key) DO NOTHING;

COMMENT ON INDEX dream_messages_user_client_msg_unique 
IS 'Ensures idempotency: prevents duplicate messages from retries or double-clicks.';
