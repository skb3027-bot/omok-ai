// ai.js
const board = document.getElementById("board");
const status = document.getElementById("status");
let cells = [];
let turn = "black"; // player first

function createBoard() {
  for (let y = 0; y < 15; y++) {
    cells[y] = [];
    for (let x = 0; x < 15; x++) {
      const div = document.createElement("div");
      div.classList.add("cell");
      div.dataset.x = x;
      div.dataset.y = y;
      div.addEventListener("click", () => place(x, y));
      board.appendChild(div);
      cells[y][x] = "";
    }
  }
}

function place(x, y) {
  if (cells[y][x] !== "") return;
  cells[y][x] = turn;
  const cell = board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  cell.classList.add(turn);
  cell.textContent = turn === "black" ? "●" : "○";
  if (checkWin(x, y, turn)) {
    status.textContent = (turn === "black" ? "플레이어" : "AI") + " 승리!";
    board.style.pointerEvents = "none";
    return;
  }
  turn = turn === "black" ? "white" : "black";
  if (turn === "white") {
    setTimeout(aiMove, 200);
  } else {
    status.textContent = "플레이어 차례입니다.";
  }
}

function aiMove() {
  // 가장 먼저 빈 칸 찾기
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      if (cells[y][x] === "") {
        place(x, y);
        return;
      }
    }
  }
}

function checkWin(x, y, color) {
  const dx = [1, 0, 1, 1];
  const dy = [0, 1, 1, -1];
  for (let d = 0; d < 4; d++) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const nx = x + dx[d] * i;
      const ny = y + dy[d] * i;
      if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15) break;
      if (cells[ny][nx] === color) count++;
      else break;
    }
    for (let i = 1; i < 5; i++) {
      const nx = x - dx[d] * i;
      const ny = y - dy[d] * i;
      if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15) break;
      if (cells[ny][nx] === color) count++;
      else break;
    }
    if (count >= 5) return true;
  }
  return false;
}

createBoard();
