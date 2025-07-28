import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      {language === 'en' ? 'ES' : 'EN'}
    </button>
  );
} 