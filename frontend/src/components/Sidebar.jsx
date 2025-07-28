import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false); // Start closed
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if dark mode was previously saved
    return localStorage.getItem('darkMode') === 'true';
  });

  // Apply dark mode on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <>
      {/* Toggle Button - Left Center */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-blue-300"
        title="Settings / Configuración"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌙</span>
          <span className="text-sm font-semibold">MENU</span>
        </div>
      </button>

      {/* Sidebar - Hidden by default */}
      <div className={`fixed left-0 top-0 h-full bg-green-800/95 backdrop-blur-lg shadow-2xl border-r-2 border-yellow-400 transition-all duration-300 z-40 ${
        isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
            <div className="text-yellow-300 text-sm">Configuración</div>
          </div>

          {/* Language Section */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              🌐 Language / Idioma
            </h4>
            <div className="space-y-3">
              <button
                onClick={toggleLanguage}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                  language === 'en'
                    ? 'bg-yellow-500 text-gray-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                English
              </button>
              <button
                onClick={toggleLanguage}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                  language === 'es'
                    ? 'bg-yellow-500 text-gray-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Dark Mode Section */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              🌙 Dark Mode / Modo Oscuro
            </h4>
            <div className="space-y-3">
              <button
                onClick={toggleDarkMode}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-yellow-500 text-gray-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>
          </div>

          {/* Game Info Section */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              ℹ️ Game Info / Info del Juego
            </h4>
            <div className="bg-black/30 rounded-lg p-4 text-white text-sm space-y-2">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-yellow-300">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Developer:</span>
                <span className="text-yellow-300">RUMI</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="text-yellow-300">Educational</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            ✕ Close / Cerrar
          </button>
        </div>
      </div>

      {/* Overlay - Only show when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 