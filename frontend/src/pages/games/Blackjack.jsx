// src/pages/games/Blackjack.jsx
import { useState, useEffect } from 'react';
import Card from './Card';
import DemographicForm from '../../components/games/DemographicForm';
import GameStatsBar from '../../components/games/GameStatsBar';
import CountdownTimer from '../../components/games/CountdownTimer';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from '../../components/Sidebar';

// Baraja completa para cálculos de probabilidad
const deck = [
  { value: 'A', suit: 'spades', points: 11 },
  { value: '2', suit: 'spades', points: 2 },
  { value: '3', suit: 'spades', points: 3 },
  { value: '4', suit: 'spades', points: 4 },
  { value: '5', suit: 'spades', points: 5 },
  { value: '6', suit: 'spades', points: 6 },
  { value: '7', suit: 'spades', points: 7 },
  { value: '8', suit: 'spades', points: 8 },
  { value: '9', suit: 'spades', points: 9 },
  { value: '10', suit: 'spades', points: 10 },
  { value: 'J', suit: 'spades', points: 10 },
  { value: 'Q', suit: 'spades', points: 10 },
  { value: 'K', suit: 'spades', points: 10 },
  { value: 'A', suit: 'hearts', points: 11 },
  { value: '2', suit: 'hearts', points: 2 },
  { value: '3', suit: 'hearts', points: 3 },
  { value: '4', suit: 'hearts', points: 4 },
  { value: '5', suit: 'hearts', points: 5 },
  { value: '6', suit: 'hearts', points: 6 },
  { value: '7', suit: 'hearts', points: 7 },
  { value: '8', suit: 'hearts', points: 8 },
  { value: '9', suit: 'hearts', points: 9 },
  { value: '10', suit: 'hearts', points: 10 },
  { value: 'J', suit: 'hearts', points: 10 },
  { value: 'Q', suit: 'hearts', points: 10 },
  { value: 'K', suit: 'hearts', points: 10 },
  { value: 'A', suit: 'diamonds', points: 11 },
  { value: '2', suit: 'diamonds', points: 2 },
  { value: '3', suit: 'diamonds', points: 3 },
  { value: '4', suit: 'diamonds', points: 4 },
  { value: '5', suit: 'diamonds', points: 5 },
  { value: '6', suit: 'diamonds', points: 6 },
  { value: '7', suit: 'diamonds', points: 7 },
  { value: '8', suit: 'diamonds', points: 8 },
  { value: '9', suit: 'diamonds', points: 9 },
  { value: '10', suit: 'diamonds', points: 10 },
  { value: 'J', suit: 'diamonds', points: 10 },
  { value: 'Q', suit: 'diamonds', points: 10 },
  { value: 'K', suit: 'diamonds', points: 10 },
  { value: 'A', suit: 'clubs', points: 11 },
  { value: '2', suit: 'clubs', points: 2 },
  { value: '3', suit: 'clubs', points: 3 },
  { value: '4', suit: 'clubs', points: 4 },
  { value: '5', suit: 'clubs', points: 5 },
  { value: '6', suit: 'clubs', points: 6 },
  { value: '7', suit: 'clubs', points: 7 },
  { value: '8', suit: 'clubs', points: 8 },
  { value: '9', suit: 'clubs', points: 9 },
  { value: '10', suit: 'clubs', points: 10 },
  { value: 'J', suit: 'clubs', points: 10 },
  { value: 'Q', suit: 'clubs', points: 10 },
  { value: 'K', suit: 'clubs', points: 10 },
];

function drawCard() {
  const idx = Math.floor(Math.random() * deck.length);
  return deck[idx];
}

function handValue(hand) {
  let sum = hand.reduce((acc, c) => acc + c.points, 0);
  let aces = hand.filter(c => c.value === 'A').length;
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

// Calcular probabilidades en tiempo real
function calculateProbabilities(playerHand, dealerVisibleCard) {
  const playerValue = handValue(playerHand);
  const dealerValue = dealerVisibleCard ? dealerVisibleCard.points : 0;
  
  // Cartas ya jugadas
  const playedCards = [...playerHand];
  if (dealerVisibleCard) playedCards.push(dealerVisibleCard);
  
  // Cartas restantes
  const remainingCards = deck.filter(card => 
    !playedCards.some(played => 
      played.value === card.value && played.suit === card.suit
    )
  );
  
  // Probabilidad de pasarse (bust)
  const bustCards = remainingCards.filter(card => {
    let newValue = playerValue + card.points;
    let aces = (playerHand.filter(c => c.value === 'A').length) + (card.value === 'A' ? 1 : 0);
    while (newValue > 21 && aces > 0) {
      newValue -= 10;
      aces--;
    }
    return newValue > 21;
  });
  
  const bustProbability = (bustCards.length / remainingCards.length * 100).toFixed(1);
  
  // Probabilidad de ganar vs dealer
  let winProbability = 0;
  if (dealerVisibleCard) {
    const favorableCards = remainingCards.filter(card => {
      let newValue = playerValue + card.points;
      let aces = (playerHand.filter(c => c.value === 'A').length) + (card.value === 'A' ? 1 : 0);
      while (newValue > 21 && aces > 0) {
        newValue -= 10;
        aces--;
      }
      return newValue <= 21 && newValue > dealerValue;
    });
    winProbability = (favorableCards.length / remainingCards.length * 100).toFixed(1);
  }
  
  return { bustProbability, winProbability };
}

export default function Blackjack() {
  const { t } = useLanguage();
  
  // Estados del juego
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [result, setResult] = useState('');
  const [playerStands, setPlayerStands] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Estados para dinero y timer
  const [money, setMoney] = useState(1000); // Saldo inicial
  const betAmount = 100; // Apuesta fija por ronda
  const [timer, setTimer] = useState(900); // 15 minutos en segundos
  const [timerActive, setTimerActive] = useState(false);
  
  // Estados demográficos
  const [showDemographics, setShowDemographics] = useState(true);
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  
  // Estados de probabilidad
  const [probabilities, setProbabilities] = useState({ bustProbability: 0, winProbability: 0 });
  
  // Timer
  const [startTime, setStartTime] = useState(null);

  // Mantener pantalla encendida
  useEffect(() => {
    let wakeLock = null;
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake lock not supported');
        }
      }
    }
    requestWakeLock();
    return () => {
      if (wakeLock && wakeLock.release) {
        wakeLock.release();
      }
    };
  }, []);

  // Timer de 15 minutos
  useEffect(() => {
    let interval = null;
    if (gameStarted && timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      // Tiempo agotado
      setTimerActive(false);
      setResult('¡Tiempo agotado!');
      // Borrar datos demográficos para forzar nuevo registro
      localStorage.removeItem('blackjack_age');
      localStorage.removeItem('blackjack_education');
    }
    return () => clearInterval(interval);
  }, [gameStarted, timerActive, timer]);

  // Cargar datos demográficos del localStorage SOLO una vez al montar
  useEffect(() => {
    const savedAge = localStorage.getItem('blackjack_age');
    const savedEducation = localStorage.getItem('blackjack_education');
    const savedMoney = localStorage.getItem('blackjack_money');
    const savedTimer = localStorage.getItem('blackjack_timer');
    const savedGameStarted = localStorage.getItem('blackjack_gameStarted');
    const savedPlayerHand = localStorage.getItem('blackjack_playerHand');
    const savedDealerHand = localStorage.getItem('blackjack_dealerHand');
    const savedResult = localStorage.getItem('blackjack_result');
    const savedPlayerStands = localStorage.getItem('blackjack_playerStands');
    
    if (savedAge && savedEducation) {
      setAge(savedAge);
      setEducationLevel(savedEducation);
      setShowDemographics(false);
      
      // Restore game state if it exists
      if (savedMoney) setMoney(parseInt(savedMoney));
      if (savedTimer) setTimer(parseInt(savedTimer));
      if (savedGameStarted === 'true') {
        setGameStarted(true);
        setTimerActive(true);
      }
      if (savedPlayerHand) setPlayerHand(JSON.parse(savedPlayerHand));
      if (savedDealerHand) setDealerHand(JSON.parse(savedDealerHand));
      if (savedResult) setResult(savedResult);
      if (savedPlayerStands === 'true') setPlayerStands(true);
    }
  // eslint-disable-next-line
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameStarted) {
      localStorage.setItem('blackjack_money', money.toString());
      localStorage.setItem('blackjack_timer', timer.toString());
      localStorage.setItem('blackjack_gameStarted', gameStarted.toString());
      localStorage.setItem('blackjack_playerHand', JSON.stringify(playerHand));
      localStorage.setItem('blackjack_dealerHand', JSON.stringify(dealerHand));
      localStorage.setItem('blackjack_result', result);
      localStorage.setItem('blackjack_playerStands', playerStands.toString());
    }
  }, [gameStarted, money, timer, playerHand, dealerHand, result, playerStands]);

  // Calcular probabilidades cuando cambian las manos
  useEffect(() => {
    if (playerHand.length > 0 && dealerHand.length > 0) {
      const probs = calculateProbabilities(playerHand, dealerHand[0]);
      setProbabilities(probs);
    }
  }, [playerHand, dealerHand]);

  const saveDemographics = (age, educationLevel) => {
    console.log('saveDemographics called with:', { age, educationLevel });
    localStorage.setItem('blackjack_age', age);
    localStorage.setItem('blackjack_education', educationLevel);
    setAge(age);
    setEducationLevel(educationLevel);
    setShowDemographics(false);
    setMoney(1000); // Reiniciar dinero
    setTimer(900); // Reiniciar timer a 15 minutos
    setTimerActive(true);
    startGame();
  };

  const startGame = () => {
    setResult('');
    setPlayerStands(false);
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard(), drawCard()]);
    setGameStarted(true);
    setStartTime(Date.now());
    setTimerActive(true);
  };

  const isBusted = handValue(playerHand) > 21;
  const canPlay = !isBusted && !result && !playerStands;

  const hit = () => {
    if (!canPlay) return;
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);
    
    if (handValue(newHand) > 21) {
      const finalResult = t('bust');
      setResult(finalResult);
      // Restar dinero por perder
      setMoney((prev) => Math.max(0, prev - betAmount));
      endGame(finalResult, handValue(newHand), handValue(dealerHand));
    }
  };

  const stand = () => {
    setPlayerStands(true);
    let dealer = [...dealerHand];
    
    while (handValue(dealer) < 17) {
      dealer.push(drawCard());
    }
    setDealerHand(dealer);
    evaluate(dealer);
  };

  const evaluate = dealer => {
    const pVal = handValue(playerHand);
    const dVal = handValue(dealer);
    let res = '';
    if (pVal > 21) res = t('bust');
    else if (dVal > 21 || pVal > dVal) res = t('win');
    else if (pVal === dVal) res = t('tie');
    else res = t('lose');
    setResult(res);
    // Ajustar dinero según resultado
    setMoney((prev) => {
      if (res === t('win')) return prev + betAmount;
      if (res === t('lose') || res === t('bust')) return Math.max(0, prev - betAmount);
      return prev;
    });
    endGame(res, pVal, dVal);
  };

  const endGame = (result, playerValue, dealerValue) => {
    // Simplemente reiniciar el juego después de un delay
    setTimeout(() => {
      setResult('');
      startGame();
    }, 2000);
  };

  // Mostrar solo la primera carta del dealer si el jugador no se ha plantado
  const visibleDealerHand = dealerHand;
  const dealerFaceDown = playerStands ? dealerHand.map(() => false) : [false, ...dealerHand.slice(1).map(() => true)];

  // Mostrar formulario demográfico si es necesario
  if (showDemographics) {
    return (
      <>
        <Sidebar />
        <DemographicForm onSubmit={saveDemographics} />
      </>
    );
  }

  // Juego principal
  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-wide">{t('educationalBlackjack')}</h1>
            <div className="text-yellow-300 font-bold text-lg mb-2">{t('blackjackPays')}</div>
            <div className="text-white text-sm">{t('dealerMustStand')}</div>
          </div>

          {/* Game Stats Bar - Top Row */}
          <div className="flex justify-between items-center mb-6 px-4">
            {/* Left Side - Timer */}
            <div className="flex-1 max-w-xs">
              <GameStatsBar money={money}>
                <CountdownTimer seconds={timer} />
              </GameStatsBar>
            </div>

            {/* Center - Game Title (hidden on mobile) */}
            <div className="hidden md:block flex-1 text-center">
              <div className="text-white text-lg font-semibold">🎮 {t('educationalBlackjack')}</div>
            </div>

            {/* Right Side - Probabilities */}
            <div className="flex-1 max-w-xs">
              {gameStarted && playerHand.length > 0 && (
                <div className="bg-black/40 rounded-lg p-3 text-center">
                  <div className="text-white text-sm mb-2">{t('realTimeProbabilities')}</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-red-300 font-bold">{probabilities.bustProbability}%</div>
                      <div className="text-white">{t('bustProbability')}</div>
                    </div>
                    <div>
                      <div className="text-green-300 font-bold">{probabilities.winProbability}%</div>
                      <div className="text-white">{t('winProbability')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Game Area */}
          <div className="bg-blue-800/80 rounded-3xl shadow-2xl border-4 border-blue-400 p-6 md:p-8">
            {/* Dealer Section */}
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-xl font-bold text-blue-300 mb-4">{t('dealer')}</h2>
              <div className="flex gap-2 mb-3">
                {visibleDealerHand.map((card, idx) => (
                  <Card key={idx} value={card.value} suit={card.suit} faceDown={dealerFaceDown[idx]} />
                ))}
              </div>
              <div className="text-white font-bold text-lg">
                {t('dealer')}: {playerStands ? handValue(dealerHand) : dealerHand[0] ? cardPointsString([dealerHand[0]]) : 0}
              </div>
            </div>
            
            {/* Player Section */}
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-xl font-bold text-blue-300 mb-4">{t('you')}</h2>
              <div className="flex gap-2 mb-3">
                {playerHand.map((card, idx) => (
                  <Card key={idx} value={card.value} suit={card.suit} />
                ))}
              </div>
              <div className="text-white font-bold text-lg">{t('you')}: {handValue(playerHand)}</div>
            </div>
            
            {/* Game Controls - Centered */}
            <div className="flex flex-col items-center space-y-4">
              {/* Main Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <button 
                  onClick={hit} 
                  disabled={!canPlay || money < betAmount} 
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 ${
                    canPlay && money >= betAmount 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg' 
                      : 'bg-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('hit')} (-${betAmount})
                </button>
                <button 
                  onClick={stand} 
                  disabled={!canPlay || money < betAmount} 
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 ${
                    canPlay && money >= betAmount 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg' 
                      : 'bg-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('stand')}
                </button>
              </div>

              {/* Session Management Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {
                    setShowDemographics(true);
                    setMoney(1000);
                    setTimer(900);
                    setTimerActive(false);
                    setGameStarted(false);
                  }} 
                  className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {t('newSession')}
                </button>
                <button 
                  onClick={() => {
                    // Clear localStorage to force new demographic entry
                    localStorage.removeItem('blackjack_age');
                    localStorage.removeItem('blackjack_education');
                    localStorage.removeItem('blackjack_money');
                    localStorage.removeItem('blackjack_timer');
                    localStorage.removeItem('blackjack_gameStarted');
                    localStorage.removeItem('blackjack_playerHand');
                    localStorage.removeItem('blackjack_dealerHand');
                    localStorage.removeItem('blackjack_result');
                    localStorage.removeItem('blackjack_playerStands');
                    setShowDemographics(true);
                    setMoney(1000);
                    setTimer(900);
                    setTimerActive(false);
                    setGameStarted(false);
                    setResult('');
                    setPlayerHand([]);
                    setDealerHand([]);
                    setPlayerStands(false);
                  }} 
                  className="px-6 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {t('finishGame')}
                </button>
              </div>
            </div>
            
            {/* Result Display */}
            {result && (
              <div className="mt-6 text-center">
                <div className="text-2xl font-extrabold text-white bg-black/60 rounded-xl px-6 py-3 animate-pulse border-2 border-blue-400">
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper para mostrar la suma de puntos de cartas visibles
function cardPointsString(hand) {
  return hand.reduce((acc, c) => acc + c.points, 0);
}