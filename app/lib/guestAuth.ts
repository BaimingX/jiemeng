import { Platform } from 'react-native';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import { getDeviceMetadata } from './deviceIdentity';

const GUEST_EMAIL_DOMAIN = 'guest.oneiro.ai';

const normalizeDeviceId = (value: string) =>
    value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export const signInAsGuest = async (): Promise<Session | null> => {
    if (Platform.OS === 'web') {
        return null;
    }

    const metadata = {
        ...(await getDeviceMetadata()),
        is_guest: true,
    };
    const deviceId = metadata.device_id;

    try {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
            options: { data: metadata },
        });

        if (!anonError && anonData.session) {
            return anonData.session;
        }
    } catch {
        // Ignore and fall back to device-based credentials.
    }

    const normalized = normalizeDeviceId(deviceId).slice(0, 32);
    if (!normalized) return null;

    const email = `device-${normalized}@${GUEST_EMAIL_DOMAIN}`;
    const password = `guest-${normalized}`;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (!signInError && signInData.session) {
        return signInData.session;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
    });

    if (!signUpError && signUpData.session) {
        return signUpData.session;
    }

    const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (!retryError && retryData.session) {
        return retryData.session;
    }

    return null;
};
