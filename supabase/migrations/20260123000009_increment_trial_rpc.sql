-- Add RPC function for atomic trial usage increment
-- This prevents race conditions when multiple requests are made simultaneously

CREATE OR REPLACE FUNCTION public.increment_trial_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trial_limit INT;
    v_trial_used INT;
    v_updated INT;
BEGIN
    -- Get current trial state
    SELECT trial_limit, trial_used
    INTO v_trial_limit, v_trial_used
    FROM public.billing_trials
    WHERE user_id = p_user_id
    FOR UPDATE;  -- Lock the row

    -- If no record found, create one
    IF NOT FOUND THEN
        INSERT INTO public.billing_trials (user_id, trial_limit, trial_used)
        VALUES (p_user_id, 5, 1)
        ON CONFLICT (user_id) DO NOTHING;
        RETURN true;
    END IF;

    -- Check if limit reached
    IF v_trial_used >= v_trial_limit THEN
        RETURN false;
    END IF;

    -- Increment usage
    UPDATE public.billing_trials
    SET trial_used = trial_used + 1,
        updated_at = now()
    WHERE user_id = p_user_id
      AND trial_used = v_trial_used;  -- Ensure we haven't been updated concurrently

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    -- If no rows updated, another transaction got there first
    IF v_updated = 0 THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Grant execute permission to authenticated users (but they'll call via Edge Function)
GRANT EXECUTE ON FUNCTION public.increment_trial_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_trial_usage(UUID) TO service_role;

COMMENT ON FUNCTION public.increment_trial_usage IS 'Atomically increments trial usage. Returns true if successful, false if limit reached.';
