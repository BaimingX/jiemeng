import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { signInAsGuest } from '../lib/guestAuth';
import { getDeviceMetadata } from '../lib/deviceIdentity';

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, isLoading: true });

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            syncDeviceMetadata(guestSession);
            setIsLoading(false);
        };

        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setSession(session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
