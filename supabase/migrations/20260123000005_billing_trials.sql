-- Billing Trials Table
-- Tracks free trial usage (5 free AI dream interpretations)

CREATE TABLE public.billing_trials (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL DEFAULT 'dream_decoder',
  trial_limit INT NOT NULL DEFAULT 5,
  trial_used INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_trials ENABLE ROW LEVEL SECURITY;

-- Users can only view their own trial status
CREATE POLICY "Users can view own trials"
ON public.billing_trials FOR SELECT
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users
-- Updates happen atomically via Edge Function with service role

-- Add constraint to prevent negative usage
ALTER TABLE public.billing_trials 
ADD CONSTRAINT check_trial_used_positive CHECK (trial_used >= 0);

ALTER TABLE public.billing_trials 
ADD CONSTRAINT check_trial_limit_positive CHECK (trial_limit > 0);

COMMENT ON TABLE public.billing_trials IS 'Free trial usage tracking. Default 5 free uses per user.';
