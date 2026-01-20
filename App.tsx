import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingHome from './components/LandingHome';
import DreamGallery from './components/DreamGallery';
import DreamMapPage from './components/DreamMapPage';
import DreamJournal from './components/DreamJournal';
import Layout from './components/Layout';
import { Language } from './types';

const LANGUAGE_STORAGE_KEY = 'dreamdecoder_language';

function App() {
  // Default to Chinese, check localStorage
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language) || 'zh';
    }
    return 'zh';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
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
      </Routes>
    </Layout>
  );
}

export default App;
