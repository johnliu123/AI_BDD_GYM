// Feature 1: 三個按鈕（石頭/剪刀/布）+ 顯示「你出了什麼」
// 之後的功能（電腦出拳、勝負判定、計分、重設、歷史紀錄）會在後續 commit 中逐步加入。

const CHOICE_LABELS = {
  rock: "石頭 ✊",
  paper: "布 ✋",
  scissors: "剪刀 ✌️",
};

const resultEl = document.getElementById("result");
const choiceButtons = document.querySelectorAll(".choice-btn");

function handleChoiceClick(event) {
  const choice = event.currentTarget.dataset.choice;
  const label = CHOICE_LABELS[choice];

  if (!label) {
    return;
  }

  resultEl.textContent = `你出了：${label}`;
}

choiceButtons.forEach((button) => {
  button.addEventListener("click", handleChoiceClick);
});
