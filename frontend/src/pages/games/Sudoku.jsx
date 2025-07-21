import { useState } from 'react';

const LEVELS = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Medio', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
];

// Tableros predefinidos para cada nivel (puedes reemplazar por un generador en el futuro)
const SUDOKU_BOARDS = {
  easy: [
    [5, 3, '', '', 7, '', '', '', ''],
    [6, '', '', 1, 9, 5, '', '', ''],
    ['', 9, 8, '', '', '', '', 6, ''],
    [8, '', '', '', 6, '', '', '', 3],
    [4, '', '', 8, '', 3, '', '', 1],
    [7, '', '', '', 2, '', '', '', 6],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9],
  ],
  medium: [
    ['', '', '', 2, 6, '', 7, '', 1],
    [6, 8, '', '', 7, '', '', 9, ''],
    [1, 9, '', '', '', 4, 5, '', ''],
    [8, 2, '', 1, '', '', '', 4, ''],
    ['', '', 4, 6, '', 2, 9, '', ''],
    ['', 5, '', '', '', 3, '', 2, 8],
    ['', '', 9, 3, '', '', '', 7, 4],
    ['', 4, '', '', 5, '', '', 3, 6],
    [7, '', 3, '', 1, 8, '', '', ''],
  ],
  hard: [
    ['', '', '', '', '', '', '', '', ''],
    [6, '', '', '', '', '', '', '', ''],
    ['', '', 1, '', 9, 5, '', '', ''],
    ['', '', 8, '', '', '', '', 6, ''],
    ['', '', '', '', '', '', '', '', 3],
    ['', '', '', '', 2, '', '', '', ''],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9],
  ],
};

function deepCopy(board) {
  return board.map(row => [...row]);
}

function isValidSudoku(board) {
  // Verifica filas, columnas y subcuadrantes 3x3
  for (let i = 0; i < 9; i++) {
    const row = new Set();
    const col = new Set();
    for (let j = 0; j < 9; j++) {
      // Filas
      if (board[i][j] === '' || isNaN(Number(board[i][j]))) return false;
      if (row.has(board[i][j])) return false;
      row.add(board[i][j]);
      // Columnas
      if (col.has(board[j][i])) return false;
      col.add(board[j][i]);
    }
  }
  // Subcuadrantes 3x3
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = board[boxRow * 3 + i][boxCol * 3 + j];
          if (box.has(val)) return false;
          box.add(val);
        }
      }
    }
  }
  return true;
}

export default function Sudoku() {
  const [level, setLevel] = useState('easy');
  const [initialBoard, setInitialBoard] = useState(deepCopy(SUDOKU_BOARDS['easy']));
  const [board, setBoard] = useState(deepCopy(SUDOKU_BOARDS['easy']));
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  // Cambiar de nivel y reiniciar tablero
  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setLevel(newLevel);
    setInitialBoard(deepCopy(SUDOKU_BOARDS[newLevel]));
    setBoard(deepCopy(SUDOKU_BOARDS[newLevel]));
    setMessage('');
    setMessageType('');
  };

  // Cambiar valor de celda
  const handleChange = (i, j, value) => {
    if (initialBoard[i][j] !== '') return; // No permitir editar celdas fijas
    if (!/^\d?$/.test(value)) return; // Solo permitir dígitos 1-9 o vacío
    const newBoard = deepCopy(board);
    newBoard[i][j] = value;
    setBoard(newBoard);
  };

  // Reiniciar tablero
  const handleReset = () => {
    setBoard(deepCopy(initialBoard));
    setMessage('');
    setMessageType('');
  };

  // Validar Sudoku
  const handleValidate = () => {
    if (isValidSudoku(board)) {
      setMessage('¡Felicidades! Sudoku resuelto correctamente.');
      setMessageType('success');
    } else {
      setMessage('El Sudoku no está resuelto correctamente. Revisa filas, columnas y bloques.');
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] py-12">
      <h1 className="text-3xl font-bold mb-6">Sudoku</h1>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Nivel:</label>
        <select
          value={level}
          onChange={handleLevelChange}
          className="p-2 rounded border border-gray-300"
        >
          {LEVELS.map(lvl => (
            <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
          ))}
        </select>
        <button onClick={handleReset} className="ml-4 px-3 py-1 bg-[#2ca6e0] text-white rounded shadow hover:bg-[#0a2342] transition">Reiniciar</button>
        <button onClick={handleValidate} className="ml-2 px-3 py-1 bg-[#ffd700] text-[#0a2342] rounded shadow hover:bg-[#2ca6e0] transition">Validar</button>
      </div>
      <div className="grid grid-cols-9 gap-1 bg-white rounded shadow p-2">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              type="text"
              maxLength={1}
              className={`w-8 h-8 text-center border rounded ${initialBoard[i][j] !== '' ? 'bg-gray-200 font-bold' : 'bg-white'}`}
              value={cell}
              onChange={e => handleChange(i, j, e.target.value.replace(/[^1-9]/, ''))}
              readOnly={initialBoard[i][j] !== ''}
            />
          ))
        )}
      </div>
      {message && (
        <div className={`mt-4 px-4 py-2 rounded text-center font-semibold ${messageType === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {message}
        </div>
      )}
      <p className="mt-4 text-gray-500">(Puedes validar tu solución en cualquier momento)</p>
    </div>
  );
} 