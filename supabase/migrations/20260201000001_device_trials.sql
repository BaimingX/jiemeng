-- Device-level trial tracking to prevent resets across account changes or reinstalls

CREATE TABLE IF NOT EXISTS public.device_trials (
    device_id TEXT PRIMARY KEY,
    trial_limit INT NOT NULL DEFAULT 5,
    trial_used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.device_trials ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_device_trial_usage(p_device_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trial_limit INT;
    v_trial_used INT;
    v_updated INT;
BEGIN
    SELECT trial_limit, trial_used
    INTO v_trial_limit, v_trial_used
    FROM public.device_trials
    WHERE device_id = p_device_id
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.device_trials (device_id, trial_limit, trial_used)
        VALUES (p_device_id, 5, 1)
        ON CONFLICT (device_id) DO NOTHING;
        RETURN true;
    END IF;

    IF v_trial_used >= v_trial_limit THEN
        RETURN false;
    END IF;

    UPDATE public.device_trials
    SET trial_used = trial_used + 1,
        updated_at = now()
    WHERE device_id = p_device_id
      AND trial_used = v_trial_used;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_device_trial_usage(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_device_trial_usage(TEXT) TO service_role;

COMMENT ON FUNCTION public.increment_device_trial_usage IS 'Atomically increments device trial usage. Returns true if successful, false if limit reached.';
