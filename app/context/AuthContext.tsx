import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { signInAsGuest } from '../lib/guestAuth';
import { getDeviceMetadata } from '../lib/deviceIdentity';

export type BillingStatus = {
    access: 'free' | 'subscription' | 'lifetime';
    isActive: boolean;
    expiresAt: string | null;
    trialRemaining: number;
    trialLimit: number;
    trialUsed: number;
    canUse: boolean;
};

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
    billingStatus: BillingStatus | null;
    refreshBillingStatus: () => Promise<void>;
    setTrialRemainingHint: (remaining: number) => void;
};

const DEFAULT_FREE_BILLING: BillingStatus = {
    access: 'free',
    isActive: false,
    expiresAt: null,
    trialRemaining: 5,
    trialLimit: 5,
    trialUsed: 0,
    canUse: true,
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
    billingStatus: null,
    refreshBillingStatus: async () => { },
    setTrialRemainingHint: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);

    const fetchBillingStatus = useCallback(async (userId?: string) => {
        let targetUserId = userId;
        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            targetUserId = user?.id;
        }

        if (!targetUserId) {
            setBillingStatus(null);
            return;
        }

        const { data, error } = await supabase
            .from('v_billing_status')
            .select('*')
            .eq('feature_key', 'dream_decoder')
            .eq('user_id', targetUserId)
            .maybeSingle();

        if (data) {
            setBillingStatus({
                access: data.access || 'free',
                isActive: data.is_active || false,
                expiresAt: data.expires_at,
                trialRemaining: data.trial_remaining ?? 5,
                trialLimit: data.trial_limit ?? 5,
                trialUsed: data.trial_used ?? 0,
                canUse: data.can_use ?? true,
            });
            return;
        }

        if (error && error.code !== 'PGRST116') {
            console.error('[Auth] Failed to fetch billing status', error);
        }

        setBillingStatus(DEFAULT_FREE_BILLING);
    }, []);

    const refreshBillingStatus = useCallback(async () => {
        await fetchBillingStatus();
    }, [fetchBillingStatus]);

    const setTrialRemainingHint = useCallback((remaining: number) => {
        setBillingStatus((prev) => {
            const safeRemaining = Math.max(0, remaining);
            if (!prev) {
                return {
                    ...DEFAULT_FREE_BILLING,
                    trialRemaining: safeRemaining,
                    trialUsed: Math.max(0, DEFAULT_FREE_BILLING.trialLimit - safeRemaining),
                    canUse: safeRemaining > 0,
                };
            }

            const trialLimit = prev.trialLimit || 5;
            return {
                ...prev,
                trialRemaining: safeRemaining,
                trialUsed: Math.max(0, trialLimit - safeRemaining),
                canUse: prev.access !== 'free' ? prev.canUse : safeRemaining > 0,
            };
        });
    }, []);

    useEffect(() => {
        let isMounted = true;

        const syncDeviceMetadata = async (currentSession: Session | null) => {
            if (Platform.OS === 'web' || !currentSession?.user) return;

            const metadata = await getDeviceMetadata();
            const currentMetadata = currentSession.user.user_metadata || {};
            const needsUpdate =
                currentMetadata.device_id !== metadata.device_id ||
                currentMetadata.platform !== metadata.platform;

            if (!needsUpdate) return;

            try {
                await supabase.auth.updateUser({
                    data: { ...currentMetadata, ...metadata },
                });
            } catch {
                // Ignore metadata sync failures.
            }
        };

        const initializeSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!isMounted) return;

            if (session) {
                setSession(session);
                await fetchBillingStatus(session.user.id);
                syncDeviceMetadata(session);
                setIsLoading(false);
                return;
            }

            if (Platform.OS === 'web') {
                setIsLoading(false);
                return;
            }

            const guestSession = await signInAsGuest();
            if (!isMounted) return;

            setSession(guestSession);
            if (guestSession?.user?.id) {
                await fetchBillingStatus(guestSession.user.id);
            } else {
                setBillingStatus(null);
            }
            syncDeviceMetadata(guestSession);
            setIsLoading(false);
        };

        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setSession(session);
            if (session?.user?.id) {
                fetchBillingStatus(session.user.id);
            } else {
                setBillingStatus(null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchBillingStatus]);

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                billingStatus,
                refreshBillingStatus,
                setTrialRemainingHint,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
