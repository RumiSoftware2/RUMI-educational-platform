// src/pages/games/Blackjack.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from './Card';

// Baraja sencilla: 2–10, J,Q,K,A (valor 11 para As)
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
  // Repite para los otros palos
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
  // Suma los valores, ajusta As si es necesario
  let sum = hand.reduce((acc, c) => acc + c.points, 0);
  let aces = hand.filter(c => c.value === 'A').length;
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

export default function Blackjack() {
  const { user } = useContext(AuthContext);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [result, setResult] = useState('');
  const [playerStands, setPlayerStands] = useState(false);

  // Mantener pantalla encendida mientras el juego está activo
  useEffect(() => {
    let wakeLock = null;
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock.addEventListener('release', () => {
            if (wakeLock.released) {
              requestWakeLock();
            }
          });
        } catch (err) {
          // Puede fallar si el usuario no interactuó o por política de permisos
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

  useEffect(() => {
    startGame();
    // eslint-disable-next-line
  }, []);

  const startGame = () => {
    setResult('');
    setPlayerStands(false);
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard(), drawCard()]);
  };

  const isBusted = handValue(playerHand) > 21;
  const canPlay = !isBusted && !result && !playerStands;

  const hit = () => {
    if (!canPlay) return;
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);
    if (handValue(newHand) > 21) {
      setResult('Perdiste, te pasaste');
      saveSession('Perdiste, te pasaste', handValue(newHand), handValue(dealerHand));
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
    if (pVal > 21) res = 'Perdiste, te pasaste';
    else if (dVal > 21 || pVal > dVal) res = 'Ganaste';
    else if (pVal === dVal) res = 'Empate';
    else res = 'Perdiste';
    setResult(res);
    saveSession(res, pVal, dVal);
  };

  const saveSession = async (resText, pVal, dVal) => {
    try {
      await api.post('/games/sessions', {
        userId: user.id,
        game: 'blackjack',
        stats: { playerScore: pVal, dealerScore: dVal, result: resText },
      });
    } catch (err) {
      console.error('Error guardando sesión', err);
    }
  };

  // Mostrar solo la primera carta del dealer si el jugador no se ha plantado
  const visibleDealerHand = playerStands ? dealerHand : [dealerHand[0]];
  const dealerFaceDown = playerStands ? dealerHand.map(() => false) : [false, ...dealerHand.slice(1).map(() => true)];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8">
      <div className="rounded-3xl shadow-2xl border-4 border-[#ffd700] bg-green-800/80 p-8 max-w-lg w-full flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Blackjack</h1>
        <div className="text-yellow-300 font-bold text-lg mb-2">BLACKJACK PAGA 3 A 2</div>
        <div className="text-white text-sm mb-4">Dealer debe plantarse en 17 suave</div>
        {/* Dealer */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 mb-2">
            {dealerHand.map((card, idx) => (
              <Card key={idx} value={card.value} suit={card.suit} faceDown={dealerFaceDown[idx]} />
            ))}
          </div>
          <div className="text-white font-bold">Dealer: {playerStands ? handValue(dealerHand) : dealerHand[0] ? cardPointsString([dealerHand[0]]) : 0}</div>
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
          <button onClick={hit} disabled={!canPlay} className={`px-6 py-2 rounded-xl font-bold text-white transition-colors ${canPlay ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}>Pedir Carta</button>
          <button onClick={stand} disabled={!canPlay} className={`px-6 py-2 rounded-xl font-bold text-white transition-colors ${canPlay ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 cursor-not-allowed'}`}>Plantarse</button>
          <button onClick={startGame} className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">Reiniciar</button>
        </div>
        {result && <div className="text-2xl font-extrabold text-white bg-black/60 rounded-xl px-4 py-2 mt-2 animate-pulse">{result}</div>}
      </div>
    </div>
  );
}

// Helper para mostrar la suma de puntos de cartas visibles
function cardPointsString(hand) {
  return hand.reduce((acc, c) => acc + c.points, 0);
}