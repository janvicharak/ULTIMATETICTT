document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const modeSelect = document.getElementById('modeSelect');
  const startScreen = document.getElementById('startScreen');
  const gameContainer = document.getElementById('gameContainer');
  const mainBoard = document.getElementById('mainBoard');
  const statusText = document.getElementById('statusText');

  const showRulesBtn = document.getElementById('showRulesBtn');
  const closeRulesBtn = document.getElementById('closeRulesBtn');
  const rulesModal = document.getElementById('rulesModal');

  showRulesBtn.onclick = () => rulesModal.classList.remove('hidden');
  closeRulesBtn.onclick = () => rulesModal.classList.add('hidden');

  let currentPlayer = 'X';
  let gameMode = '2p';
  let boards = [];
  let boardWinners = Array(9).fill(null);
  let nextBoardIndex = null;
  let gameOver = false;

  startBtn.onclick = () => {
    gameMode = modeSelect.value;
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initGame();
  };

  restartBtn.onclick = () => {
    gameContainer.classList.add('hidden');
    startScreen.classList.remove('hidden');
  };

  function initGame() {
    boards = [];
    boardWinners = Array(9).fill(null);
    gameOver = false;
    nextBoardIndex = null;
    currentPlayer = 'X';
    mainBoard.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const smallBoard = document.createElement('div');
      smallBoard.classList.add('small-board');
      smallBoard.dataset.board = i;
      let cells = [];

      for (let j = 0; j < 9; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = j;
        cell.onclick = () => handleCellClick(i, j, cell);
        smallBoard.appendChild(cell);
        cells.push(null);
      }

      boards.push(cells);
      mainBoard.appendChild(smallBoard);
    }

    updateStatus();
    if (gameMode === '1p' && currentPlayer === 'O') {
      setTimeout(makeAIMove, 500);
    }
  }

  function handleCellClick(boardIndex, cellIndex, cellEl) {
    if (gameOver || cellEl.textContent !== '' || boardWinners[boardIndex]) return;
    if (nextBoardIndex !== null && boardIndex !== nextBoardIndex) return;

    boards[boardIndex][cellIndex] = currentPlayer;
    cellEl.textContent = currentPlayer;
    cellEl.classList.add(currentPlayer === 'X' ? 'x-cell' : 'o-cell');

    checkSmallWin(boardIndex);
    if (checkBigWin()) return;

    nextBoardIndex = boardWinners[cellIndex] ? null : cellIndex;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    if (gameMode === '1p' && currentPlayer === 'O' && !gameOver) {
      setTimeout(makeAIMove, 500);
    }
  }

  function checkSmallWin(boardIndex) {
    const b = boards[boardIndex];
    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,b1,c] of winPatterns) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        boardWinners[boardIndex] = b[a];
        const boardEl = mainBoard.children[boardIndex];
        boardEl.classList.add(b[a] === 'X' ? 'won-x' : 'won-o');
        Array.from(boardEl.children).forEach(cell => cell.classList.add('disabled'));
        return;
      }
    }
    if (b.every(c => c)) {
      boardWinners[boardIndex] = 'T';
      Array.from(mainBoard.children[boardIndex].children).forEach(cell => cell.classList.add('disabled'));
    }
  }

  function checkBigWin() {
    const b = boardWinners.map(w => w === 'T' ? null : w);
    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,b1,c] of winPatterns) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        gameOver = true;
        statusText.textContent = `${b[a]} Wins the Game!`;
        return true;
      }
    }

    if (boardWinners.every(w => w)) {
      gameOver = true;
      const xCount = boardWinners.filter(w => w === 'X').length;
      const oCount = boardWinners.filter(w => w === 'O').length;
      statusText.textContent = xCount === oCount
        ? "It's a Draw!"
        : `${xCount > oCount ? 'X' : 'O'} Wins the Game!`;
      return true;
    }

    return false;
  }

  function updateStatus() {
    statusText.textContent = `Turn: ${currentPlayer}`;
    Array.from(mainBoard.children).forEach((boardEl, index) => {
      boardEl.classList.remove('highlight');
      if (nextBoardIndex === null || index === nextBoardIndex) {
        boardEl.classList.add('highlight');
      }
    });
  }

  function makeAIMove() {
    const validBoards = boardWinners.map((w, i) => w ? null : i).filter(i => i !== null);
    const boardIndex = nextBoardIndex !== null && !boardWinners[nextBoardIndex]
      ? nextBoardIndex
      : validBoards[Math.floor(Math.random() * validBoards.length)];
    const available = boards[boardIndex].map((val, i) => val ? null : i).filter(i => i !== null);
    const cellIndex = available[Math.floor(Math.random() * available.length)];
    const cell = mainBoard.children[boardIndex].children[cellIndex];
    handleCellClick(boardIndex, cellIndex, cell);
  }
});
