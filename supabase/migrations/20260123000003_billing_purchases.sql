-- Billing Purchases Table
-- Records one-time payments (lifetime purchases)

CREATE TABLE public.billing_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_key TEXT NOT NULL CHECK (plan_key IN ('lifetime')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  status TEXT,  -- 'succeeded' 'requires_payment_method' ...
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only view their own purchases
CREATE POLICY "Users can view own purchases"
ON public.billing_purchases FOR SELECT
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users
-- All writes happen via webhook/service role

-- Add index for user lookups
CREATE INDEX idx_billing_purchases_user 
ON public.billing_purchases(user_id);

COMMENT ON TABLE public.billing_purchases IS 'One-time purchase records (lifetime). Synced via Stripe webhooks.';
