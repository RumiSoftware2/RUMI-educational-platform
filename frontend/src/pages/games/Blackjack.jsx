// src/pages/games/Blackjack.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

// Baraja sencilla: 2–10, J,Q,K,A (valor 11 para As)
const cards = [2,3,4,5,6,7,8,9,10,10,10,10,11];

function drawCard() {
  const idx = Math.floor(Math.random() * cards.length);
  return cards[idx];
}

export default function Blackjack() {
  const { user } = useContext(AuthContext);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [result, setResult] = useState('');

  useEffect(() => {
    startGame();
  }, []);

  const handValue = hand => hand.reduce((sum, c) => sum + c, 0);

  const startGame = () => {
    setResult('');
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard(), drawCard()]);
  };

  const hit = () => {
    setPlayerHand([...playerHand, drawCard()]);
  };

  const stand = () => {
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
    if (pVal > 21) res = 'Perdiste';
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

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Blackjack: Probabilidad Condicional</h1>
      <div className="mb-4">
        <h2 className="font-semibold">Mano Jugador: {handValue(playerHand)}</h2>
        <p>{playerHand.join(', ')}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Mano Dealer: {handValue(dealerHand)}</h2>
        <p>{dealerHand.join(', ')}</p>
      </div>
      <div className="flex gap-4 mb-4">
        <button onClick={hit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Pedir Carta</button>
        <button onClick={stand} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Plantarse</button>
        <button onClick={startGame} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Reiniciar</button>
      </div>
      {result && <p className="text-lg font-bold">Resultado: {result}</p>}
    </div>
     );
}