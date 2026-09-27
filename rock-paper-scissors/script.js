// 猜拳遊戲 - 需求 1：使用者選擇出拳，系統隨機產生電腦出拳並顯示雙方結果

const CHOICES = [
  { key: "scissors", label: "✌️ 剪刀" },
  { key: "rock", label: "✊ 石頭" },
  { key: "paper", label: "✋ 布" },
];

const playerChoiceEl = document.getElementById("player-choice");
const computerChoiceEl = document.getElementById("computer-choice");
const choiceButtons = document.querySelectorAll(".choice-btn");

function getLabel(key) {
  const found = CHOICES.find((choice) => choice.key === key);
  return found ? found.label : "－";
}

function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * CHOICES.length);
  return CHOICES[randomIndex].key;
}

function playRound(playerKey) {
  const computerKey = getComputerChoice();

  playerChoiceEl.textContent = getLabel(playerKey);
  computerChoiceEl.textContent = getLabel(computerKey);
}

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const playerKey = button.dataset.choice;
    playRound(playerKey);
  });
});
