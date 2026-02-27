import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Language } from './types';

const LandingHome = lazy(() => import('./components/LandingHome'));
const DreamGallery = lazy(() => import('./components/DreamGallery'));
const DreamMapPage = lazy(() => import('./components/DreamMapPage'));
const DreamJournal = lazy(() => import('./components/DreamJournal'));
const SubscribePage = lazy(() => import('./components/SubscribePage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const FeedbackPage = lazy(() => import('./components/FeedbackPage'));
const FAQPage = lazy(() => import('./components/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const DreamMeaningIndexPage = lazy(() => import('./components/DreamMeaningIndexPage'));
const DreamClusterPage = lazy(() => import('./components/DreamClusterPage'));
const DreamTopicPage = lazy(() => import('./components/DreamTopicPage'));
const DreamInterpretationGuidePage = lazy(() => import('./components/DreamInterpretationGuidePage'));
const MarketsIndexPage = lazy(() => import('./components/MarketsIndexPage'));
const MarketPage = lazy(() => import('./components/MarketPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

const LEGACY_LANGUAGE_STORAGE_KEY = 'dreamdecoder_language';
const LANGUAGE_STORAGE_KEY = 'oneiroai_language';

const RouteFallback = () => (
    <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-sm">
        Loading...
    </div>
);

function App() {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
            const legacyStored = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY) as Language | null;
            if (stored || legacyStored) return (stored || legacyStored) as Language;
            return 'en';
        }
        return 'en';
    });

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY);
    }, [language]);

    return (
        <Layout language={language} onToggleLanguage={toggleLanguage}>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<LandingHome language={language} onToggleLanguage={toggleLanguage} />} />
                    <Route path="/gallery" element={<DreamGallery language={language} />} />
                    <Route path="/map" element={<DreamMapPage language={language} />} />
                    <Route path="/journal" element={<DreamJournal language={language} />} />
                    <Route path="/profile" element={<ProfilePage language={language} />} />
                    <Route path="/subscribe" element={<SubscribePage language={language} />} />
                    <Route path="/feedback" element={<FeedbackPage language={language} />} />
                    <Route path="/faq" element={<FAQPage language={language} />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage language={language} />} />
                    <Route path="/terms" element={<TermsPage language={language} />} />
                    <Route path="/about" element={<AboutPage language={language} />} />
                    <Route path="/dream-meaning" element={<DreamMeaningIndexPage language={language} />} />
                    <Route path="/dream-meaning/cluster/:clusterSlug" element={<DreamClusterPage language={language} />} />
                    <Route path="/dream-meaning/:slug" element={<DreamTopicPage language={language} />} />
                    <Route path="/dream-interpretation" element={<DreamInterpretationGuidePage language={language} />} />
                    <Route path="/markets" element={<MarketsIndexPage language={language} />} />
                    <Route path="/markets/:slug" element={<MarketPage language={language} />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*" element={<NotFoundPage language={language} />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default App;
