-- Update handle_new_user() trigger function
-- Adds automatic initialization of billing_trials and billing_entitlements for new users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  -- Initialize free trial (3 uses)
  INSERT INTO public.billing_trials (user_id, feature_key, trial_limit, trial_used)
  VALUES (new.id, 'dream_decoder', 3, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize entitlement as free user (inactive until they have a subscription/lifetime)
  INSERT INTO public.billing_entitlements (user_id, feature_key, access, is_active)
  VALUES (new.id, 'dream_decoder', 'free', false)
  ON CONFLICT (user_id, feature_key) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on_auth_user_created already exists, so we just need to replace the function
