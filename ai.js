// ai.js (전략형 Omok AI)
// 5목 우선 → 4막기 → 3목 공격 → 중앙 우선
const SIZE = 15;
const EMPTY = 0, BLACK = 1, WHITE = 2;  // BLACK=상대, WHITE=AI
let board = Array.from({length:SIZE}, ()=>Array(SIZE).fill(EMPTY));

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');

// 승리 체크 (연속된 5개)
function isWin(x,y,color){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for(let [dx,dy] of dirs){
    let cnt=1;
    for(let d=1; d<5; d++){
      let nx=x+dx*d, ny=y+dy*d;
      if(nx<0||ny<0||nx>=SIZE||ny>=SIZE||board[ny][nx]!==color) break;
      cnt++;
    }
    for(let d=1; d<5; d++){
      let nx=x-dx*d, ny=y-dy*d;
      if(nx<0||ny<0||nx>=SIZE||ny>=SIZE||board[ny][nx]!==color) break;
      cnt++;
    }
    if(cnt>=5) return true;
  }
  return false;
}

// 주변 후보 수 목록 (2칸 이내)
function genMoves(){
  let set = new Set();
  for(let y=0; y<SIZE; y++)for(let x=0; x<SIZE; x++){
    if(board[y][x]!==EMPTY){
      for(let dy=-2; dy<=2; dy++)for(let dx=-2; dx<=2; dx++){
        let nx=x+dx, ny=y+dy;
        if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===EMPTY){
          set.add(ny*SIZE+nx);
        }
      }
    }
  }
  return Array.from(set).map(v=>[v%SIZE, Math.floor(v/SIZE)]);
}

// 중앙 거리 우선 점수
function centerScore(x,y){
  let cx=(SIZE-1)/2, cy=(SIZE-1)/2;
  return -Math.hypot(x-cx,y-cy);
}

// 최적 착수 위치 찾기
function findBest(){
  let moves = genMoves();
  if(moves.length===0){
    // 완전 초기판이면 중앙
    return [[Math.floor(SIZE/2), Math.floor(SIZE/2)]];
  }
  // 1) 즉시 승리 수
  for(let [x,y] of moves){
    board[y][x] = WHITE;
    if(isWin(x,y,WHITE)){ board[y][x]=EMPTY; return [x,y]; }
    board[y][x] = EMPTY;
  }
  // 2) 즉시 방어(상대 승리 막기)
  for(let [x,y] of moves){
    board[y][x] = BLACK;
    if(isWin(x,y,BLACK)){ board[y][x]=EMPTY; return [x,y]; }
    board[y][x] = EMPTY;
  }
  // 3) 3목 공격 우선 (열린 3 체크)
  let best = null, bestScore = -1e9;
  for(let [x,y] of moves){
    let score = centerScore(x,y);
    // 임시 착수해보고 열린3 개수 간단 평가
    board[y][x] = WHITE;
    let cnt3 = countOpenThrees(x,y,WHITE);
    board[y][x] = EMPTY;
    score += cnt3 * 100;
    if(score > bestScore){
      bestScore = score;
      best = [x,y];
    }
  }
  return best;
}

// 열린 3 계산 (간단 버전)
function countOpenThrees(x,y,color){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  let total = 0;
  for(let [dx,dy] of dirs){
    // -2,-1,0,1,2 위치에 열린3 형태 있는지
    let line = [];
    for(let d=-2; d<=2; d++){
      let nx=x+dx*d, ny=y+dy*d;
      if(nx<0||ny<0||nx>=SIZE||ny>=SIZE){ line.push(-1); }
      else line.push(board[ny][nx]);
    }
    // 슬라이딩 윈도우 3개 연속 WHITE(=2)이고 양쪽이 EMPTY인 패턴 검사
    for(let i=0; i<=2; i++){
      if(line[i+1]===color && line[i+2]===color && line[i+3]===color
         && line[i]===EMPTY && line[i+4]===EMPTY){
        total++;
      }
    }
  }
  return total;
}

// UI 이벤트 연결
for(let y=0; y<SIZE; y++){
  for(let x=0; x<SIZE; x++){
    let cell = boardEl.children[y*SIZE + x];
    cell.onclick = ()=>{
      if(board[y][x]!==EMPTY) return;
      // 상대 착수
      board[y][x] = BLACK;
      cell.innerHTML = `<div class="stone" style="background:#000"></div>`;
      // AI 착수
      setTimeout(()=>{
        let [ax,ay] = findBest();
        board[ay][ax] = WHITE;
        let c2 = boardEl.children[ay*SIZE + ax];
        c2.innerHTML = `<div class="stone" style="background:#fff"></div>`;
        c2.classList.add('highlight');
        statusEl.textContent = `AI 착수: (${ax+1},${ay+1})`;
      }, 500 + Math.random()*1500);
    };
  }
}
