// src/pages/games/Blackjack.jsx
import { useState, useEffect } from 'react';
import Card from './Card';
import DemographicForm from '../../components/games/DemographicForm';
import GameStatsBar from '../../components/games/GameStatsBar';
import SessionAnalysis from '../../components/games/SessionAnalysis';
import CountdownTimer from '../../components/games/CountdownTimer';

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

// Quizzes matemáticos sobre probabilidad
const mathQuizzes = [
  {
    question: "¿Cuál es la probabilidad de obtener un As en la siguiente carta?",
    options: ["1/13", "4/52", "1/4", "1/52"],
    correct: 1,
    explanation: "Hay 4 Ases en una baraja de 52 cartas, por lo que la probabilidad es 4/52 = 1/13"
  },
  {
    question: "Si tienes 16 puntos, ¿cuál es la probabilidad de pasarte con la siguiente carta?",
    options: ["Menos del 30%", "Entre 30-50%", "Entre 50-70%", "Más del 70%"],
    correct: 2,
    explanation: "Necesitas 6 o más puntos para pasarte. Hay 20 cartas con 6+ puntos de 52 cartas = 38.5%"
  },
  {
    question: "¿Cuál es la probabilidad de obtener un 10, J, Q o K?",
    options: ["1/4", "1/13", "4/13", "1/3"],
    correct: 2,
    explanation: "Hay 16 cartas con valor 10 (4 de cada tipo: 10, J, Q, K) de 52 cartas = 16/52 = 4/13"
  }
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
  // Estados del juego
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [result, setResult] = useState('');
  const [playerStands, setPlayerStands] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // NUEVO: Estados para dinero y timer
  const [money, setMoney] = useState(1000); // Saldo inicial
  const betAmount = 100; // Apuesta fija por ronda
  // Cambia el valor inicial del timer a 900 segundos
  const [timer, setTimer] = useState(900); // 15 minutos en segundos
  const [timerActive, setTimerActive] = useState(false);
  
  // Estados demográficos
  const [showDemographics, setShowDemographics] = useState(true);
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  
  // Estados de análisis
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    quizScore: 0,
    totalQuizzes: 0,
    decisions: [],
    timeSpent: 0
  });
  
  // Estados de quiz
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  
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

  // Timer de 10 minutos
  useEffect(() => {
    let interval = null;
    if (gameStarted && timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      // Tiempo agotado
      setShowAnalysis(true);
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
    if (savedAge && savedEducation) {
      setAge(savedAge);
      setEducationLevel(savedEducation);
      setShowDemographics(false);
    }
  // eslint-disable-next-line
  }, []);

  // Calcular probabilidades cuando cambian las manos
  useEffect(() => {
    if (playerHand.length > 0 && dealerHand.length > 0) {
      const probs = calculateProbabilities(playerHand, dealerHand[0]);
      setProbabilities(probs);
    }
  }, [playerHand, dealerHand]);

  const saveDemographics = () => {
    if (age && educationLevel) {
      localStorage.setItem('blackjack_age', age);
      localStorage.setItem('blackjack_education', educationLevel);
      setShowDemographics(false);
      setMoney(1000); // Reiniciar dinero
      setTimer(900); // Reiniciar timer a 15 minutos
      setTimerActive(true);
      startGame();
    }
  };

  const startGame = () => {
    setResult('');
    setPlayerStands(false);
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard(), drawCard()]);
    setGameStarted(true);
    setStartTime(Date.now());
    setShowAnalysis(false);
    setTimerActive(true);
  };

  const isBusted = handValue(playerHand) > 21;
  const canPlay = !isBusted && !result && !playerStands;

  const hit = () => {
    if (!canPlay) return;
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);
    
    // Registrar decisión
    setGameStats(prev => ({
      ...prev,
      decisions: [...prev.decisions, { action: 'hit', playerValue: handValue(newHand) }]
    }));
    
    if (handValue(newHand) > 21) {
      const finalResult = 'Perdiste, te pasaste';
      setResult(finalResult);
      // Restar dinero por perder
      setMoney((prev) => Math.max(0, prev - betAmount));
      endGame(finalResult, handValue(newHand), handValue(dealerHand));
    }
  };

  const stand = () => {
    setPlayerStands(true);
    let dealer = [...dealerHand];
    
    // Registrar decisión
    setGameStats(prev => ({
      ...prev,
      decisions: [...prev.decisions, { action: 'stand', playerValue: handValue(playerHand) }]
    }));
    
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
    if (pVal > 21) res = 'Perdiste, te pasaste';
    else if (dVal > 21 || pVal > dVal) res = 'Ganaste';
    else if (pVal === dVal) res = 'Empate';
    else res = 'Perdiste';
    setResult(res);
    // Ajustar dinero según resultado
    setMoney((prev) => {
      if (res === 'Ganaste') return prev + betAmount;
      if (res === 'Perdiste' || res === 'Perdiste, te pasaste') return Math.max(0, prev - betAmount);
      return prev;
    });
    endGame(res, pVal, dVal);
  };

  const endGame = (result, playerValue, dealerValue) => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    setGameStats(prev => ({
      ...prev,
      rounds: prev.rounds + 1,
      wins: prev.wins + (result === 'Ganaste' ? 1 : 0),
      losses: prev.losses + (result === 'Perdiste' || result === 'Perdiste, te pasaste' ? 1 : 0),
      ties: prev.ties + (result === 'Empate' ? 1 : 0),
      timeSpent: prev.timeSpent + timeSpent
    }));
    
    // Mostrar quiz ocasionalmente
    if (Math.random() < 0.3) { // 30% de probabilidad
      const randomQuiz = mathQuizzes[Math.floor(Math.random() * mathQuizzes.length)];
      setCurrentQuiz(randomQuiz);
      setShowQuiz(true);
      setQuizAnswered(false);
    } else {
      setShowAnalysis(true);
    }
  };

  const answerQuiz = (selectedOption) => {
    if (quizAnswered) return;
    
    const isCorrect = selectedOption === currentQuiz.correct;
    setGameStats(prev => ({
      ...prev,
      quizScore: prev.quizScore + (isCorrect ? 1 : 0),
      totalQuizzes: prev.totalQuizzes + 1
    }));
    
    setQuizAnswered(true);
    
    setTimeout(() => {
      setShowQuiz(false);
      setShowAnalysis(true);
    }, 3000);
  };

  const sendDataToBackend = async () => {
    try {
      const gameData = {
        demographics: { age, educationLevel },
        gameStats,
        timestamp: new Date().toISOString()
      };
      
      // Aquí enviarías los datos al backend Python
      console.log('Datos del juego:', gameData);
      
      // Por ahora solo simulamos el enví
      // await fetch('https://tu-backend-python.com/api/game/analyze-basic', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(gameData)
      // });
      
    } catch (error) {
      console.error('Error enviando datos:', error);
    }
  };

  // Al mostrar análisis, si dinero = 0 o timer = 0, borrar datos demográficos
  if (showAnalysis && (money === 0 || timer === 0)) {
    localStorage.removeItem('blackjack_age');
    localStorage.removeItem('blackjack_education');
  }

  // Mostrar solo la primera carta del dealer si el jugador no se ha plantado
  const visibleDealerHand = dealerHand;
  const dealerFaceDown = playerStands ? dealerHand.map(() => false) : [false, ...dealerHand.slice(1).map(() => true)];

  // Reemplazar el formulario demográfico, barra de stats y análisis por los componentes nuevos
  if (showDemographics) {
    return <DemographicForm onSubmit={saveDemographics} />;
  }

  if (showQuiz && currentQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8">
        <div className="rounded-3xl shadow-2xl border-4 border-[#ffd700] bg-green-800/80 p-8 max-w-lg w-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Quiz Matemático</h2>
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-white text-lg mb-4">{currentQuiz.question}</p>
            <div className="space-y-2">
              {currentQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => answerQuiz(index)}
                  disabled={quizAnswered}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    quizAnswered
                      ? index === currentQuiz.correct
                        ? 'bg-green-600 text-white'
                        : index === currentQuiz.correct
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizAnswered && (
              <div className="mt-4 p-3 bg-yellow-600/80 rounded-lg">
                <p className="text-white text-sm">{currentQuiz.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showAnalysis) {
    return (
      <SessionAnalysis
        gameStats={gameStats}
        money={money}
        timer={timer}
        onNewSession={() => {
          setShowAnalysis(false);
          setShowDemographics(true); // Forzar nuevo registro
          setMoney(1000);
          setTimer(900);
          setTimerActive(false);
          setGameStarted(false);
        }}
        onAdvancedAnalysis={() => {
          sendDataToBackend();
          setShowAnalysis(false);
          setShowDemographics(true);
          setMoney(1000);
          setTimer(900);
          setTimerActive(false);
          setGameStarted(false);
        }}
      />
    );
  }

  // Juego principal
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8 px-4">
      <div className="rounded-3xl shadow-2xl border-4 border-[#ffd700] bg-green-800/80 p-8 max-w-lg w-full flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Blackjack Educativo</h1>
        <div className="text-yellow-300 font-bold text-lg mb-2">BLACKJACK PAGA 3 A 2</div>
        <div className="text-white text-sm mb-4">Dealer debe plantarse en 17 suave</div>
        
        {/* Probabilidades en tiempo real */}
        {gameStarted && playerHand.length > 0 && (
          <div className="bg-black/40 rounded-lg p-3 mb-4 text-center">
            <div className="text-white text-sm mb-2">Probabilidades en tiempo real:</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-red-300 font-bold">{probabilities.bustProbability}%</div>
                <div className="text-white">Prob. de pasarse</div>
              </div>
              <div>
                <div className="text-green-300 font-bold">{probabilities.winProbability}%</div>
                <div className="text-white">Prob. de ganar</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dealer */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 mb-2">
            {visibleDealerHand.map((card, idx) => (
              <Card key={idx} value={card.value} suit={card.suit} faceDown={dealerFaceDown[idx]} />
            ))}
          </div>
          <div className="text-white font-bold">
            Dealer: {playerStands ? handValue(dealerHand) : dealerHand[0] ? cardPointsString([dealerHand[0]]) : 0}
          </div>
        </div>
        
        {/* Player */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 mb-2">
            {playerHand.map((card, idx) => (
              <Card key={idx} value={card.value} suit={card.suit} />
            ))}
          </div>
          <div className="text-white font-bold">Tú: {handValue(playerHand)}</div>
        </div>
        
        {/* Controles */}
        <div className="flex gap-4 mb-4">
          <button 
            onClick={hit} 
            disabled={!canPlay || money < betAmount} 
            className={`px-6 py-2 rounded-xl font-bold text-white transition-colors ${
              canPlay && money >= betAmount ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Pedir Carta (-${betAmount})
          </button>
          <button 
            onClick={stand} 
            disabled={!canPlay || money < betAmount} 
            className={`px-6 py-2 rounded-xl font-bold text-white transition-colors ${
              canPlay && money >= betAmount ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Plantarse
          </button>
          <button 
            onClick={() => {
              setShowDemographics(true);
              setMoney(1000);
              setTimer(900);
              setTimerActive(false);
              setGameStarted(false);
            }} 
            className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Nueva Sesión
          </button>
        </div>
        
        {result && (
          <div className="text-2xl font-extrabold text-white bg-black/60 rounded-xl px-4 py-2 mt-2 animate-pulse">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper para mostrar la suma de puntos de cartas visibles
function cardPointsString(hand) {
  return hand.reduce((acc, c) => acc + c.points, 0);
}