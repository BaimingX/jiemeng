import React, { ReactNode } from 'react';
import Topbar from './Topbar';
import { Language } from '../types';
import LoginPopup from './LoginPopup';

interface LayoutProps {
    children: ReactNode;
    language: Language;
    onToggleLanguage: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, language, onToggleLanguage }) => {
    const [showLoginModal, setShowLoginModal] = React.useState(false);

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

            <LoginPopup
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                language={language}
            />
        </div>
    );
};

export default Layout;
