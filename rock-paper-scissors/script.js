// 猜拳遊戲
// 需求 1：使用者選擇出拳，系統隨機產生電腦出拳並顯示雙方結果
// 需求 2：判斷本回合勝負

const CHOICES = [
  { key: "scissors", label: "✌️ 剪刀" },
  { key: "rock", label: "✊ 石頭" },
  { key: "paper", label: "✋ 布" },
];

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

function playRound(playerKey) {
  const computerKey = getComputerChoice();
  const result = judgeRound(playerKey, computerKey);

  playerChoiceEl.textContent = getLabel(playerKey);
  computerChoiceEl.textContent = getLabel(computerKey);
  renderResult(result);
}

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const playerKey = button.dataset.choice;
    playRound(playerKey);
  });
});
