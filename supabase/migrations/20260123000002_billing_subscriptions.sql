-- Billing Subscriptions Table
-- Stores Stripe subscription state for each user (one row per user)

CREATE TABLE public.billing_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,           -- For debugging and analytics
  stripe_product_id TEXT,         -- For debugging and analytics
  plan_key TEXT CHECK (plan_key IN ('monthly', 'yearly')),
  plan_interval TEXT CHECK (plan_interval IN ('month', 'year')),  -- Stripe interval
  amount_cents INTEGER,           -- Subscription amount for analytics
  currency TEXT DEFAULT 'usd',    -- Currency code
  status TEXT,  -- 'active' 'trialing' 'past_due' 'canceled' ...
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.billing_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users
-- All writes happen via webhook/service role

-- Add indexes for faster lookups
CREATE INDEX idx_billing_subscriptions_stripe_customer 
ON public.billing_subscriptions(stripe_customer_id);

CREATE INDEX idx_billing_subscriptions_stripe_subscription 
ON public.billing_subscriptions(stripe_subscription_id);

COMMENT ON TABLE public.billing_subscriptions IS 'Stripe subscription state synced via webhooks. Users can only read.';
