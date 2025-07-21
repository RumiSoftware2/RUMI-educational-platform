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

function getErrorCells(board) {
  // Devuelve un Set de claves 'i-j' de celdas con errores
  const errors = new Set();
  // Filas y columnas
  for (let i = 0; i < 9; i++) {
    const rowMap = {};
    const colMap = {};
    for (let j = 0; j < 9; j++) {
      const rowVal = board[i][j];
      const colVal = board[j][i];
      if (rowVal && rowVal !== '') {
        if (rowMap[rowVal]) {
          errors.add(`${i}-${j}`);
          errors.add(`${i}-${rowMap[rowVal] - 1}`);
        }
        rowMap[rowVal] = j + 1;
      }
      if (colVal && colVal !== '') {
        if (colMap[colVal]) {
          errors.add(`${j}-${i}`);
          errors.add(`${colMap[colVal] - 1}-${i}`);
        }
        colMap[colVal] = j + 1;
      }
    }
  }
  // Bloques 3x3
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const blockMap = {};
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const val = board[row][col];
          if (val && val !== '') {
            const key = `${row}-${col}`;
            if (blockMap[val]) {
              errors.add(key);
              errors.add(blockMap[val]);
            }
            blockMap[val] = key;
          }
        }
      }
    }
  }
  return errors;
}

export default function Sudoku() {
  const [level, setLevel] = useState('easy');
  const [initialBoard, setInitialBoard] = useState(deepCopy(SUDOKU_BOARDS['easy']));
  const [board, setBoard] = useState(deepCopy(SUDOKU_BOARDS['easy']));
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'
  const [selectedCell, setSelectedCell] = useState(null); // [i, j] o null

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

  // Nuevo: manejar selección de celda
  const handleCellClick = (i, j) => {
    if (initialBoard[i][j] !== '') return;
    setSelectedCell([i, j]);
  };

  // Nuevo: manejar click en número del teclado
  const handleKeypadClick = (num) => {
    if (!selectedCell) return;
    const [i, j] = selectedCell;
    const newBoard = deepCopy(board);
    newBoard[i][j] = num;
    setBoard(newBoard);
  };

  // Nuevo: borrar celda seleccionada
  const handleKeypadErase = () => {
    if (!selectedCell) return;
    const [i, j] = selectedCell;
    const newBoard = deepCopy(board);
    newBoard[i][j] = '';
    setBoard(newBoard);
  };

  const errorCells = getErrorCells(board);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-12">
      <h1 className="text-3xl font-bold mb-6">Sudoku</h1>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="font-semibold text-lg">Nivel:</label>
        <div className="relative">
          <select
            value={level}
            onChange={handleLevelChange}
            className="p-2 pr-8 rounded-lg border-2 border-[#0a2342] text-lg shadow bg-white font-bold focus:outline-none focus:ring-2 focus:ring-[#ffd700] transition"
            style={{ minWidth: '120px', backgroundPosition: 'right 0.5rem center' }}
          >
            {LEVELS.map(lvl => (
              <option
                key={lvl.value}
                value={lvl.value}
                className={
                  lvl.value === level
                    ? 'bg-[#ffd700] text-[#0a2342] font-extrabold'
                    : 'bg-white text-[#0a2342]'
                }
              >
                {lvl.label}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#0a2342] text-xl">▼</span>
        </div>
        <button onClick={handleReset} className="px-4 py-2 bg-[#0a2342] text-white rounded-lg shadow font-bold text-lg hover:bg-[#2ca6e0] transition">Reiniciar</button>
        <button onClick={handleValidate} className="px-4 py-2 bg-[#ffd700] text-[#0a2342] rounded-lg shadow font-bold text-lg hover:bg-[#2ca6e0] hover:text-white transition">Revisar</button>
      </div>
      <div className="overflow-auto">
        <div className="grid grid-cols-9 gap-0 bg-white rounded-2xl shadow-2xl p-4 border-4 border-[#0a2342] mx-auto"
          style={{
            width: 'min(90vw, 540px)',
            height: 'min(90vw, 540px)',
            maxWidth: '540px',
            maxHeight: '540px',
            minWidth: '320px',
            minHeight: '320px',
          }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => {
              const isSelected = selectedCell && selectedCell[0] === i && selectedCell[1] === j;
              const isError = errorCells.has(`${i}-${j}`);
              const borderClasses = [
                'w-full h-full aspect-square text-center border',
                'text-2xl md:text-3xl',
                initialBoard[i][j] !== '' ? 'bg-gray-200 font-bold' : 'bg-white',
                i % 3 === 0 ? 'border-t-4 border-t-[#0a2342]' : 'border-t',
                j % 3 === 0 ? 'border-l-4 border-l-[#0a2342]' : 'border-l',
                i === 8 ? 'border-b-4 border-b-[#0a2342]' : 'border-b',
                j === 8 ? 'border-r-4 border-r-[#0a2342]' : 'border-r',
                'focus:outline-none focus:ring-2 focus:ring-[#2ca6e0] focus:z-10',
                isSelected ? 'ring-4 ring-[#ffd700] z-10' : '',
                isError ? 'border-red-500 bg-red-100' : '',
              ].join(' ');
              return (
                <input
                  key={`${i}-${j}`}
                  type="text"
                  maxLength={1}
                  className={borderClasses}
                  value={cell}
                  onClick={() => handleCellClick(i, j)}
                  readOnly
                  style={{ minWidth: '32px', minHeight: '32px', cursor: initialBoard[i][j] === '' ? 'pointer' : 'default' }}
                />
              );
            })
          )}
        </div>
      </div>
      {/* Teclado numérico personalizado */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 mb-2">
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <button
            key={num}
            onClick={() => handleKeypadClick(String(num))}
            className="w-12 h-12 md:w-16 md:h-16 bg-[#2ca6e0] text-white text-2xl md:text-3xl font-bold rounded-lg shadow hover:bg-[#0a2342] focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleKeypadErase}
          className="w-12 h-12 md:w-16 md:h-16 bg-[#ffd700] text-[#0a2342] text-xl font-bold rounded-lg shadow hover:bg-[#2ca6e0] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0a2342]"
        >
          Borrar
        </button>
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