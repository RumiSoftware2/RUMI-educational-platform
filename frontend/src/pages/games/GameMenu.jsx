// src/pages/games/GameMenu.jsx
import { Link } from 'react-router-dom';

export default function GameMenu() {
  const games = [
    { id: 'blackjack', name: 'Blackjack: Probabilidad Condicional' },
    // más juegos futuros aquí
  ];

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Juegos Matemáticos</h1>
      <ul className="space-y-4">
        {games.map(game => (
          <li key={game.id}>
            <Link
              to={`/games/${game.id}`}
              className="block p-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {game.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}