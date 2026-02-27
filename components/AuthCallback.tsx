import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from './Seo';

/**
 * OAuth callback handler for Supabase Auth.
 * This component handles the redirect from OAuth providers (e.g., Google).
 * Supabase's auth library automatically processes the URL hash/query params
 * and updates the session. We just need to redirect to the home page.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const hasAuthPayload =
            searchParams.has('code') ||
            searchParams.has('error') ||
            hashParams.has('access_token') ||
            hashParams.has('refresh_token') ||
            hashParams.has('error');

        if (!hasAuthPayload) return;

        // Supabase auth automatically handles the OAuth callback
        // The onAuthStateChange listener in AuthContext will pick up the session
        // We just need to redirect to the home page after a brief moment
        const timer = setTimeout(() => {
            navigate('/', { replace: true });
        }, 100);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#070B14]">
            <Seo
                title="Sign In | Oneiro AI"
                description="Secure sign-in callback."
                path="/auth/callback"
                lang="en"
                noIndex={true}
            />
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Signing you in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
