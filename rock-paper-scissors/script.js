// 猜拳遊戲
// 需求 1：使用者選擇出拳，系統隨機產生電腦出拳並顯示雙方結果
// 需求 2：判斷本回合勝負
// 需求 3：累計玩家的勝、平、敗次數
// 需求 4：提供「重設」功能，清除目前比分與遊戲紀錄
// 需求 5：保留最近 5 回合的對戰紀錄

const CHOICES = [
  { key: "scissors", label: "✌️ 剪刀" },
  { key: "rock", label: "✊ 石頭" },
  { key: "paper", label: "✋ 布" },
];

const INITIAL_ROUND_MESSAGE = "選一個出拳開始遊戲";
const EMPTY_CHOICE_PLACEHOLDER = "－";
const MAX_HISTORY = 5;

const RESULT_TEXT = {
  win: "贏",
  lose: "輸",
  draw: "平手",
};

// key 打敗誰：剪刀勝布、石頭勝剪刀、布勝石頭
const BEATS = {
  scissors: "paper",
  rock: "scissors",
  paper: "rock",
};

const playerChoiceEl = document.getElementById("player-choice");
const computerChoiceEl = document.getElementById("computer-choice");
const roundResultEl = document.getElementById("round-result");
const choiceButtons = document.querySelectorAll(".choice-btn");
const resetBtnEl = document.getElementById("reset-btn");
const historyListEl = document.getElementById("history-list");

const history = [];
let roundCounter = 0;

const scoreValueEls = {
  win: document.getElementById("score-win"),
  draw: document.getElementById("score-draw"),
  lose: document.getElementById("score-lose"),
};

const score = { win: 0, draw: 0, lose: 0 };

function getLabel(key) {
  const found = CHOICES.find((choice) => choice.key === key);
  return found ? found.label : "－";
}

function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * CHOICES.length);
  return CHOICES[randomIndex].key;
}

// 回傳 "win" | "lose" | "draw"（皆站在玩家角度）
function judgeRound(playerKey, computerKey) {
  if (playerKey === computerKey) {
    return "draw";
  }
  return BEATS[playerKey] === computerKey ? "win" : "lose";
}

function renderResult(result) {
  const messages = {
    win: "🎉 你贏了！",
    lose: "😵 你輸了！",
    draw: "🤝 平手！",
  };

  roundResultEl.textContent = messages[result];
  roundResultEl.classList.remove("win", "lose", "draw");
  roundResultEl.classList.add(result);
}

function renderScore() {
  scoreValueEls.win.textContent = score.win;
  scoreValueEls.draw.textContent = score.draw;
  scoreValueEls.lose.textContent = score.lose;
}

function renderHistory() {
  historyListEl.innerHTML = "";

  if (history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "history-empty";
    emptyItem.textContent = "尚無紀錄";
    historyListEl.appendChild(emptyItem);
    return;
  }

  // 新的回合顯示在最上面
  history
    .slice()
    .reverse()
    .forEach((entry) => {
      const item = document.createElement("li");
      item.className = "history-item " + entry.result;
      item.innerHTML =
        '<span class="history-round">#' + entry.round + "</span>" +
        "<span>你 " + entry.playerLabel + " ・ 電腦 " + entry.computerLabel + "</span>" +
        '<span class="history-outcome">' + RESULT_TEXT[entry.result] + "</span>";
      historyListEl.appendChild(item);
    });
}

function recordHistory(playerKey, computerKey, result) {
  roundCounter += 1;
  history.push({
    round: roundCounter,
    playerLabel: getLabel(playerKey),
    computerLabel: getLabel(computerKey),
    result: result,
  });

  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  renderHistory();
}

function playRound(playerKey) {
  const computerKey = getComputerChoice();
  const result = judgeRound(playerKey, computerKey);

  playerChoiceEl.textContent = getLabel(playerKey);
  computerChoiceEl.textContent = getLabel(computerKey);
  renderResult(result);

  score[result] += 1;
  renderScore();

  recordHistory(playerKey, computerKey, result);
}

function resetGame() {
  score.win = 0;
  score.draw = 0;
  score.lose = 0;
  renderScore();

  playerChoiceEl.textContent = EMPTY_CHOICE_PLACEHOLDER;
  computerChoiceEl.textContent = EMPTY_CHOICE_PLACEHOLDER;

  roundResultEl.textContent = INITIAL_ROUND_MESSAGE;
  roundResultEl.classList.remove("win", "lose", "draw");

  history.length = 0;
  roundCounter = 0;
  renderHistory();
}

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const playerKey = button.dataset.choice;
    playRound(playerKey);
  });
});

resetBtnEl.addEventListener("click", resetGame);
