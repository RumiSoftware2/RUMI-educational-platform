import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CountdownTimer({ seconds }) {
  const { t } = useLanguage();
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  const isLowTime = seconds <= 60; // Warning when 1 minute or less remains
  
  return (
    <div className={`bg-black/40 rounded-lg px-4 py-2 text-center ${isLowTime ? 'animate-pulse' : ''}`}>
      <div className="text-white text-xs">{t('timeRemaining')}</div>
      <div className={`font-bold text-lg ${isLowTime ? 'text-red-300' : 'text-yellow-300'}`}>
        {timeString}
      </div>
    </div>
  );
} 