import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface BillingStatus {
    access: 'free' | 'subscription' | 'lifetime';
    isActive: boolean;
    expiresAt: string | null;
    trialRemaining: number;
    trialLimit: number;
    trialUsed: number;
    canUse: boolean;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: any | null;
    billingStatus: BillingStatus | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
    refreshBillingStatus: () => Promise<void>;
    openCheckout: (planKey: 'monthly' | 'yearly' | 'lifetime') => Promise<void>;
    openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchBillingStatus(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchBillingStatus(session.user.id);
            } else {
                setProfile(null);
                setBillingStatus(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (data) setProfile(data);
            if (error) console.error('Error fetching profile:', error);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchBillingStatus = async (userId?: string) => {
        try {
            const targetUserId = userId;
            const { data, error } = await supabase
                .from('v_billing_status')
                .select('*')
                .eq('feature_key', 'dream_decoder')
                .maybeSingle();

            if (data) {
                setBillingStatus({
                    access: data.access || 'free',
                    isActive: data.is_active || false,
                    expiresAt: data.expires_at,
                    trialRemaining: data.trial_remaining ?? 3,
                    trialLimit: data.trial_limit ?? 3,
                    trialUsed: data.trial_used ?? 0,
                    canUse: data.can_use ?? true,
                });
                return;
            } else {
                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching billing status:', error);
                }

                const lifetime = await supabase
                    .from('billing_purchases')
                    .select('status')
                    .eq('plan_key', 'lifetime')
                    .eq('status', 'succeeded')
                    .maybeSingle();

                if (lifetime.data) {
                    setBillingStatus({
                        access: 'lifetime',
                        isActive: true,
                        expiresAt: null,
                        trialRemaining: 0,
                        trialLimit: 0,
                        trialUsed: 0,
                        canUse: true,
                    });
                    return;
                }

                if (targetUserId) {
                    const subscription = await supabase
                        .from('billing_subscriptions')
                        .select('status, current_period_end')
                        .eq('user_id', targetUserId)
                        .maybeSingle();

                    if (subscription.data?.status) {
                        const isActive = ['active', 'trialing'].includes(subscription.data.status);
                        setBillingStatus({
                            access: 'subscription',
                            isActive,
                            expiresAt: subscription.data.current_period_end,
                            trialRemaining: 0,
                            trialLimit: 0,
                            trialUsed: 0,
                            canUse: isActive,
                        });
                        return;
                    }
                }

                // Default for users without billing records yet
                setBillingStatus({
                    access: 'free',
                    isActive: false,
                    expiresAt: null,
                    trialRemaining: 3,
                    trialLimit: 3,
                    trialUsed: 0,
                    canUse: true,
                });
            }
        } catch (error) {
            console.error('Error fetching billing status:', error);
        }
    };

    const refreshBillingStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        await fetchBillingStatus(user?.id);
    };

    const openCheckout = async (planKey: 'monthly' | 'yearly' | 'lifetime') => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.access_token) {
                console.error('Checkout error: missing session', sessionError);
                alert('Please log in again to continue.');
                return;
            }

            const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session', {
                body: {
                    plan_key: planKey,
                    success_url: `${window.location.origin}/?billing=success`,
                    cancel_url: `${window.location.origin}/?billing=canceled`,
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (error) {
                console.error('Checkout error:', error);
                alert('Failed to open checkout. Please try again.');
                return;
            }

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to open checkout. Please try again.');
        }
    };

    const openCustomerPortal = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.access_token) {
                console.error('Portal error: missing session', sessionError);
                alert('Please log in again to continue.');
                return;
            }

            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
            const headers: Record<string, string> = {
                Authorization: `Bearer ${session.access_token}`,
            };
            if (anonKey) {
                headers.apikey = anonKey;
            }

            const { data, error } = await supabase.functions.invoke('stripe-customer-portal', {
                body: {
                    return_url: `${window.location.origin}/subscribe`,
                },
                headers,
            });

            if (error) {
                console.error('Portal error:', error);
                alert('Failed to open billing portal. Please try again.');
                return;
            }

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Failed to open billing portal. Please try again.');
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
            },
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return (
        <AuthContext.Provider value={{
            session, user, profile, billingStatus, loading,
            signInWithEmail, signUp, signOut, refreshBillingStatus, openCheckout, openCustomerPortal
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
