import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingHome from './components/LandingHome';
import DreamGallery from './components/DreamGallery';
import DreamMapPage from './components/DreamMapPage';
import DreamJournal from './components/DreamJournal';
import SubscribePage from './components/SubscribePage';
import ProfilePage from './components/ProfilePage';
import FeedbackPage from './components/FeedbackPage';
import FAQPage from './components/FAQPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import DreamMeaningIndexPage from './components/DreamMeaningIndexPage';
import DreamTopicPage from './components/DreamTopicPage';
import MarketsIndexPage from './components/MarketsIndexPage';
import MarketPage from './components/MarketPage';
import Layout from './components/Layout';
import { Language } from './types';

const LEGACY_LANGUAGE_STORAGE_KEY = 'dreamdecoder_language';
const LANGUAGE_STORAGE_KEY = 'oneiroai_language';

function App() {
  // Default to Chinese, check localStorage
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      const legacyStored = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored || legacyStored) return (stored || legacyStored) as Language;
      const browserLang = navigator.language?.toLowerCase() || '';
      return browserLang.startsWith('zh') ? 'zh' : 'en';
    }
    return 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY);
      return newLang;
    });
  };

  return (
    <Layout language={language} onToggleLanguage={toggleLanguage}>
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
        <Route path="/dream-meaning" element={<DreamMeaningIndexPage language={language} />} />
        <Route path="/dream-meaning/:slug" element={<DreamTopicPage language={language} />} />
        <Route path="/markets" element={<MarketsIndexPage language={language} />} />
        <Route path="/markets/:slug" element={<MarketPage language={language} />} />
      </Routes>
    </Layout>
  );
}

export default App;

