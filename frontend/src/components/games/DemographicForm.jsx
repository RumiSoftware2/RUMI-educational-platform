import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemographicForm({ onSubmit }) {
  const { t } = useLanguage();
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [subLevel, setSubLevel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { age, educationLevel, subLevel });

    if (age && educationLevel) {
      console.log('Calling onSubmit with data...');
      // Combine education level with sub level if applicable
      const finalEducationLevel = subLevel ? `${educationLevel}_${subLevel}` : educationLevel;
      onSubmit(age, finalEducationLevel);
    }
  };

  const handleEducationChange = (e) => {
    setEducationLevel(e.target.value);
    setSubLevel(''); // Reset sub level when education level changes
  };

  return (
    <>
      <style>
        {`
          .demographic-container {
            --dark-mode: 0;
            transition: all 0.3s ease;
          }
          
          .demographic-container.dark-mode-active {
            --dark-mode: 1;
          }
          
          .demographic-container.dark-mode-active {
            filter: invert(1) hue-rotate(180deg);
          }
          
          .demographic-container.dark-mode-active img,
          .demographic-container.dark-mode-active svg {
            filter: invert(1) hue-rotate(180deg);
          }
        `}
      </style>
      <div className="demographic-container min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-green-800/80 rounded-3xl shadow-2xl border-4 border-yellow-400 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-wide">{t('educationalBlackjack')}</h1>
              <div className="text-yellow-300 text-lg font-semibold">🎮 {t('startGame')}</div>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="age-input" className="block text-white font-bold mb-3 text-lg">{t('age')}:</label>
                <input
                  id="age-input"
                  name="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none bg-white/90 text-gray-800 font-semibold transition-all duration-200"
                  placeholder={t('enterAge')}
                  min="1"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="education-input" className="block text-white font-bold mb-3 text-lg">{t('educationLevel')}:</label>
                <select
                  id="education-input"
                  name="educationLevel"
                  value={educationLevel}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none bg-white/90 text-gray-800 font-semibold transition-all duration-200"
                  required
                >
                  <option value="">{t('selectEducation')}</option>
                  <option value="primaria">{t('primary')}</option>
                  <option value="secundaria">{t('secondary')}</option>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="universidad">{t('university')}</option>
                  <option value="posgrado">{t('postgraduate')}</option>
                </select>
              </div>

              {/* Sub-level options for Primary */}
              {educationLevel === 'primaria' && (
                <div>
                  <label htmlFor="sub-level-input" className="block text-white font-bold mb-3 text-lg">Grado:</label>
                  <select
                    id="sub-level-input"
                    name="subLevel"
                    value={subLevel}
                    onChange={(e) => setSubLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none bg-white/90 text-gray-800 font-semibold transition-all duration-200"
                    required
                  >
                    <option value="">Selecciona el grado...</option>
                    <option value="primero">Primero</option>
                    <option value="segundo">Segundo</option>
                    <option value="tercero">Tercero</option>
                    <option value="cuarto">Cuarto</option>
                    <option value="quinto">Quinto</option>
                  </select>
                </div>
              )}

              {/* Sub-level options for Bachillerato */}
              {educationLevel === 'bachillerato' && (
                <div>
                  <label htmlFor="sub-level-input" className="block text-white font-bold mb-3 text-lg">Grado:</label>
                  <select
                    id="sub-level-input"
                    name="subLevel"
                    value={subLevel}
                    onChange={(e) => setSubLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none bg-white/90 text-gray-800 font-semibold transition-all duration-200"
                    required
                  >
                    <option value="">Selecciona el grado...</option>
                    <option value="sexto">Sexto</option>
                    <option value="septimo">Séptimo</option>
                    <option value="octavo">Octavo</option>
                    <option value="noveno">Noveno</option>
                    <option value="decimo">Décimo</option>
                    <option value="once">Once</option>
                  </select>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!age || !educationLevel || (educationLevel === 'primaria' && !subLevel) || (educationLevel === 'bachillerato' && !subLevel)}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  age && educationLevel && ((educationLevel === 'primaria' && subLevel) || (educationLevel === 'bachillerato' && subLevel) || (educationLevel !== 'primaria' && educationLevel !== 'bachillerato'))
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                {t('startGame')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 