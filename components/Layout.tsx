import React, { ReactNode, useEffect, useRef } from 'react';
import Topbar from './Topbar';
import Footer from './Footer';
import { Language } from '../types';
import LoginPopup from './LoginPopup';
import { useAuth } from '../context/AuthContext';
import { getConversationDates, initDB, restoreFromSupabase } from '../services/dreamDB';

interface LayoutProps {
    children: ReactNode;
    language: Language;
    onToggleLanguage: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, language, onToggleLanguage }) => {
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const { user } = useAuth();
    const restoreAttemptRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user?.id || restoreAttemptRef.current === user.id) return;

        const restoreIfEmpty = async () => {
            try {
                await initDB();
                const dates = await getConversationDates();
                if (dates.length === 0) {
                    await restoreFromSupabase();
                }
                restoreAttemptRef.current = user.id;
            } catch (error) {
                console.error('Failed to restore dream history', error);
            }
        };

        restoreIfEmpty();
    }, [user?.id]);

    return (
        <div className="min-h-screen w-full bg-[#0B0F19] text-slate-200 font-sans selection:bg-indigo-500/30">
            <Topbar
                language={language}
                onToggleLanguage={onToggleLanguage}
                onOpenLogin={() => setShowLoginModal(true)}
            />

            <main className="pt-24 min-h-screen">
                {children}
            </main>

            <Footer language={language} />

            <LoginPopup
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                language={language}
            />
        </div>
    );
};

export default Layout;
