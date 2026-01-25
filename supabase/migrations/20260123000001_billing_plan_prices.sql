-- Billing Plan Prices Table
-- Maps plan_key to Stripe price_id for easy lookup

CREATE TABLE public.billing_plan_prices (
  plan_key TEXT PRIMARY KEY,  -- 'monthly' | 'yearly' | 'lifetime'
  stripe_price_id TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('subscription', 'payment')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_plan_prices ENABLE ROW LEVEL SECURITY;

-- Separate policies for anon (before login) and authenticated users
-- This allows showing pricing on landing page before user logs in

CREATE POLICY "Anon can read active plan prices"
ON public.billing_plan_prices FOR SELECT
TO anon
USING (active = true);

CREATE POLICY "Auth can read active plan prices"
ON public.billing_plan_prices FOR SELECT
TO authenticated
USING (active = true);

-- Add comment for documentation
COMMENT ON TABLE public.billing_plan_prices IS 'Maps plan keys to Stripe price IDs. Managed by admin/service role only.';
