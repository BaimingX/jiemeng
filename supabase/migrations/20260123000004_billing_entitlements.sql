-- Billing Entitlements Table
-- Unified view of user access rights (free/subscription/lifetime)

CREATE TABLE public.billing_entitlements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,  -- 'dream_decoder'
  access TEXT NOT NULL CHECK (access IN ('free', 'subscription', 'lifetime')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,     -- For subscriptions; NULL for lifetime
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.billing_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can only view their own entitlements
CREATE POLICY "Users can view own entitlements"
ON public.billing_entitlements FOR SELECT
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users
-- All writes happen via webhook/service role or trigger

-- Add index for checking active entitlements
CREATE INDEX idx_billing_entitlements_active 
ON public.billing_entitlements(user_id, feature_key) 
WHERE is_active = true;

COMMENT ON TABLE public.billing_entitlements IS 'User access rights. lifetime: is_active=true, expires_at=null. subscription: is_active=true, expires_at>now().';
