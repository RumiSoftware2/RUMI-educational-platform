import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemographicForm({ onSubmit }) {
  const { t } = useLanguage();
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { age, educationLevel });

    if (age && educationLevel) {
      console.log('Calling onSubmit with data...');
      onSubmit(age, educationLevel);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8 px-4">
      <div className="rounded-3xl shadow-2xl border-4 border-[#ffd700] bg-green-800/80 p-8 max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center">{t('educationalBlackjack')}</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="age-input" className="block text-white font-bold mb-2">{t('age')}:</label>
            <input
              id="age-input"
              name="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none"
              placeholder={t('enterAge')}
              min="1"
              max="120"
              required
            />
          </div>
          <div>
            <label htmlFor="education-input" className="block text-white font-bold mb-2">{t('educationLevel')}:</label>
            <select
              id="education-input"
              name="educationLevel"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none"
              required
            >
              <option value="">{t('selectEducation')}</option>
              <option value="primaria">{t('primary')}</option>
              <option value="secundaria">{t('secondary')}</option>
              <option value="preparatoria">{t('highSchool')}</option>
              <option value="universidad">{t('university')}</option>
              <option value="posgrado">{t('postgraduate')}</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!age || !educationLevel}
            className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
              age && educationLevel
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {t('startGame')}
          </button>
        </form>
      </div>
    </div>
  );
} 