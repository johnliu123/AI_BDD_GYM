---
name: trunk-based-development
description: >-
  以 Trunk-Based Development (TBD) 為核心的 Git / 開發流程判斷與執行 Skill。啟動後依 SKILL.md
  內 SOP Phase 逐步執行：自動盤點 Git 與分支狀態、產出現況摘要、依 TBD 原則判斷 Branch/Merge、
  Short-Lived Branch、Integration、Review、CI、Feature Flag、Release 策略，並偵測違反 TBD 的
  情況提出改善。Commit 訊息委派 git-conventional-commit。資訊不足時先問；高風險 Git/release/flag
  操作先確認。使用情境：TBD 開發、分支/合併策略、feature flag、流程健檢、Gitflow 漸進遷移、
  或 AI 接手「需求→Branch→開發→Commit→Integration→Review→Test→Merge→Release」全流程。
  觸發詞：Trunk-Based Development、TBD、trunk、短命分支、feature flag、Branch by Abstraction、
  release branch、分支策略、Gitflow 遷移、「這樣做對嗎」等。
disable-model-invocation: true
---

# Trunk-Based Development — AI Project Ownership Skill

## 定位

這不是 TBD 教學文件，而是讓 AI 在 Trunk-Based Development 框架下**主動 Own Git / 開發流程**的 Workflow Skill。使用者不需要懂 TBD；AI 須用證據（腳本 JSON、Git、CI）判斷，而非套公式。

**核心工作方式**：Evidence First → Project-Aware → 依 Decision Snapshot / workflow 決策樹 → 資訊不足就問 → 低風險自動做、高風險先確認。

## 核心原則（道，細節見 [principles.md](references/principles.md)）

| 原則 | 一句話 |
|---|---|
| Trunk First | 以單一 trunk 為整合中心，長期分支是例外 |
| Short-Lived Branch | 硬上限 1–2 天，超過即風險訊號 |
| Small Changes | 小批次、高頻整合，diff 越小越好 |
| Continuous Integration | 至少每日整合；trunk 須可建置/可測試 |
| Automation First | 用 CI/測試讓小步快跑安全 |
| Feature Decoupling | Feature Flag / Branch by Abstraction 分離合併與上線 |
| Project-Aware | 尊重專案既有慣例，不盲目套規則 |
| Evidence First | 用 Git/CI 證據判斷 |
| Minimal Assumption | 關鍵資訊不足就問 |

## Decision Snapshot（快徑；偏離時須 READ 對應 RuleFile）

**Q1 — 直推 trunk 還是開分支？** trivial + 慣例允許直推 + 本地測試綠 → 可直推；否則 short-lived branch。

**Q2 — 分支還「短命」嗎？** >2 天或 diff >~400 行或多次衝突 → 拆 PR / 配對完成 / flag 先併回部分。

**Q3 — 需要解耦嗎？** 跨 >1 天且使用者可感 → Feature Flag；大範圍內部重構 → Branch by Abstraction；後端替換驗證 → Dark Launch；否則不需要。

**Q4 — 發布方式？** 可持續部署 → 從 trunk；多版本/審核/法規 → release branch（不合回 trunk，修復先 trunk 再 cherry-pick）。

完整 Decision Tree 見 [workflow.md](references/workflow.md)。

# SOP

執行時複製 checklist 追蹤進度（依任務裁剪，但 **Phase 0 不可跳過**）：

```
Progress:
- [ ] Phase 0: 蒐證與現況摘要
- [ ] Phase 1: 任務分類與分支策略
- [ ] Phase 2: 開發與解耦
- [ ] Phase 3: Commit（含委派 commit skill）
- [ ] Phase 4: 同步、Review、CI、Merge
- [ ] Phase 5: Release 與收尾（含健康度）
```

## Phase 0 -- 蒐證與現況摘要

1. DELEGATE 自本 skill 根目錄執行 `python scripts/analyze_tbd_context.py --repo <專案根> --include-health`（若環境偏好 `uv run scripts/analyze_tbd_context.py`，且已安裝 uv，可等價使用）；腳本非 0 或非 git repo 時停止並回報，不猜測。
2. READ 讀取 `templates/context-summary.md` 與 `templates/context-summary.example.md`，確認現況摘要的固定欄位。
3. THINK 依腳本 JSON 填寫摘要：trunk、活躍分支、workflow_style_hint、CI/flag 線索；標記腳本無法涵蓋的缺口。
4. READ 讀取 `rules/Rule-TBD-Git操作與互動.md` 的 Rule 1（關鍵資訊不足須先問）；若 release/部署/flag 治理/遷移範圍仍未知，先向使用者提問，**不得進入 Phase 1**。
5. WRITE 依模板產出現況摘要（可內部使用或簡要呈報使用者）；後續所有策略判斷須能對應摘要中的證據欄位。

## Phase 1 -- 任務分類與分支策略

1. THINK 將任務分類為 bugfix / feature / refactor / chore / large migration，並估算檔案數、diff 規模、是否可於 1–2 天內完成（對照 [workflow.md](references/workflow.md#stage-1任務分類與規模估算)）。
2. THINK 依 Decision Snapshot Q1 做初步判斷；若非 trivial 或證據不足，進入下一步讀取規則。
3. READ 讀取 `rules/Rule-TBD-Branch與Merge.md`，依 Project-Aware 證據決定直推 trunk 或建立 short-lived branch（命名依專案慣例）。
4. READ 若 `workflow_style_hint` 為 `gitflow_like` 或使用者要求遷移 TBD，讀取 `rules/Rule-TBD-例外與健康度.md` Rule 4，僅提出漸進方案，不擅自改寫團隊流程。
5. WRITE 向使用者說明選定的分支策略及依據的 Git 證據；高風險 Git 操作依 `rules/Rule-TBD-Git操作與互動.md` Rule 3 先確認。

## Phase 2 -- 開發與解耦

1. READ 若任務可能跨 >1 天、大範圍重構、或需真流量驗證，讀取 `rules/Rule-TBD-解耦與Flag.md`；否則依 workflow Stage 3 小步開發即可。
2. READ 需要 Decision Tree 細節時，讀取 [workflow.md](references/workflow.md#stage-3開發含解耦判斷decision-tree-2) 對應章節。
3. THINK 開發期間經常同步 trunk 進分支；若 Decision Snapshot Q2 顯示分支過老/過大，依 `rules/Rule-TBD-Branch與Merge.md` Rule 3 處理後再繼續。
4. WRITE 產出或更新開發/解耦計畫（flag 名稱、owner、BbA 步驟等），並標註預期每日整合節奏。

## Phase 3 -- Commit

1. READ 讀取 `rules/Rule-TBD-Commit與Review.md` Rule 1，確認 commit 粒度與建置要求。
2. DELEGATE 當使用者要求 commit、撰寫 commit message、或本 Phase 要提交變更時，讀取並執行 **git-conventional-commit** skill 的完整 SOP（路徑優先 `.agent/skills/git-conventional-commit/SKILL.md`，其次 `.cursor/skills/git-conventional-commit/SKILL.md`）；本 skill 不跳過其驗證與高風險確認步驟。
3. READ 任何將執行的 Git 寫入操作前，再次對照 `rules/Rule-TBD-Git操作與互動.md` Rule 2–3。

## Phase 4 -- 同步、Review、CI、Merge

1. READ 合併前讀取 `rules/Rule-TBD-Branch與Merge.md` Rule 4–5，完成與 trunk 同步並確認整合頻率與合併策略。
2. READ 開 PR 與審查時讀取 `rules/Rule-TBD-Commit與Review.md` Rule 3–4。
3. READ CI gate 與 trunk 變紅處置讀取 `rules/Rule-TBD-CI與Release.md` Rule 1–2；需要 merge queue 時讀 Rule 5。
4. READ 執行 merge、刪分支、rebase、force-push 等操作前讀取 `rules/Rule-TBD-Git操作與互動.md` Rule 3。
5. WRITE merge 完成後確認 post-merge trunk 健康，並刪除已合併的短命分支（低風險可自動；刪除含未合併 commit 的分支須確認）。

## Phase 5 -- Release 與收尾

1. READ 讀取 `rules/Rule-TBD-CI與Release.md` Rule 3–4，依部署能力決定 release 路徑（含 flag rollout 確認，對照 `rules/Rule-TBD-解耦與Flag.md` Rule 4）。
2. READ 若為 hotfix、大型 schema、或 release train 例外，讀取 `rules/Rule-TBD-例外與健康度.md` Rule 1–2。
3. DELEGATE 執行 `python scripts/analyze_tbd_context.py --repo <專案根> --include-health` 更新證據（或重用 Phase 0 結果若時間間隔極短且無新 merge）。
4. READ 讀取 `templates/health-check-report.md` 與 `templates/health-check-report.example.md`。
5. WRITE 產出健康度報告（使用者要求健檢、完成較大功能、或發現明顯反模式時必做）；不合格項對照 [anti-patterns.md](references/anti-patterns.md) 提出改善。
6. WRITE 排程 Feature Flag 清理（若適用），並簡要回報本次 TBD 流程結果與尚未解決的限制。

## 驗證與異常

- 偵測到可能違反 TBD 時：依 [anti-patterns.md](references/anti-patterns.md) 對症狀→根因→改善，Project-Aware 提出方案，高風險修復仍須確認。
- 規則索引（法）：`rules/` 目錄 RuleFile；歷史長文索引見 [references/rules.md](references/rules.md)。

## 補充資源

| 檔案 | 何時讀 |
|---|---|
| [glossary.md](references/glossary.md) | 術語速查 |
| [principles.md](references/principles.md) | 說明「為什麼」 |
| [workflow.md](references/workflow.md) | 完整 Stage SOP 與 Decision Tree |
| [tools.md](references/tools.md) | 工具鏈對照（先偵測既有，不擅自引入） |
| [anti-patterns.md](references/anti-patterns.md) | 「這樣做對嗎」/ 健檢改善 |
| [examples.md](references/examples.md) | 行為校準範例 |
