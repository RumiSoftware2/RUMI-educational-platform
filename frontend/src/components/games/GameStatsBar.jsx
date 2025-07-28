import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function GameStatsBar({ money, children }) {
  const { t } = useLanguage();
  
  return (
    <div className="flex gap-6 mb-4 items-center">
      <div className="text-white font-bold">
        {t('money')}: ${money}
      </div>
      {children}
    </div>
  );
} 