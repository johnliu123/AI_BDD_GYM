---
name: git-conventional-commit
description: >-
  Drives an evidence-based, decision-tree workflow that analyzes git status/diff,
  infers change intent, decides whether to split changes into multiple atomic
  commits, chooses the Conventional Commits type/scope, detects Breaking Changes,
  drafts and validates a commit message, gets human confirmation on risky or
  uncertain steps, and safely runs `git commit` — then verifies the result. The
  user does not need to know anything about Conventional Commits, semver,
  commitlint, or git internals; this skill supplies the judgment. Use this skill
  whenever the user asks to commit changes, write/generate a commit message,
  review `git diff`/`git status` before committing, split staged changes into
  separate commits, decide a commit type/scope, or mentions "commit",
  "commit message", "git commit", "conventional commits", "commitlint",
  "semantic-release", "breaking change", "幫我 commit", "怎麼 commit",
  "commit message 怎麼寫" — even if they never say "Conventional Commits" by name.
---

# Conventional Commits — AI 自主判斷 Commit Workflow

## 定位

這不是 Conventional Commits 教學，而是讓 AI 從「看懂變更」到「commit 完成並回報」的 **Workflow Skill**。使用者不必懂規範；除非使用者主動問，不要上課。

**Skill 根目錄**（腳本與 `rules/` 均相對此路徑）：優先 `.agent/skills/git-conventional-commit/`，其次 `.cursor/skills/git-conventional-commit/`。

## 核心原則

| 原則 | 一句話 |
|---|---|
| Intent First | 先懂意圖與影響，再寫 commit |
| Evidence First | 以 diff／腳本 JSON 判斷，不猜 |
| Minimal Assumption | 資訊不足就問 |
| Project-Aware | 專案慣例優先於教科書格式 |
| Atomic Commit | 一 commit 一個清楚目的 |
| Validation Before Commit | commit 前必跑訊息驗證 |
| Human Confirmation | 高風險或不確定必須確認 |

## Decision Snapshot（快徑）

- **只要 message、不要 commit** → 走 Phase 0–4，必要時 Phase 5；**不進 Phase 6**（見 `rules/Rule-Commit-人類確認.md` Rule 3）。
- **單一邏輯、無 breaking、驗證通過、慣例清楚** → Phase 5 可快過，仍須 Phase 7 回報，禁止靜默 commit。
- **breaking／多 commit 拆分／gitmoji 衝突／密鑰／改寫歷史** → Phase 5 必須確認。

決策樹細節見 [decision-trees.md](references/decision-trees.md)。

# SOP

執行時複製 checklist（依任務裁剪，**Phase 0 與 Phase 1 不可跳過**）：

```
Progress:
- [ ] Phase 0: 偵測專案 commit 慣例
- [ ] Phase 1: 蒐證與阻斷條件
- [ ] Phase 2: 意圖與 atomic 拆分
- [ ] Phase 3: 組裝訊息（type / scope / breaking / body / footer）
- [ ] Phase 4: 驗證訊息
- [ ] Phase 5: 人類確認閘
- [ ] Phase 6: staging 與 git commit
- [ ] Phase 7: 事後驗證與回報
```

## Phase 0 -- 偵測專案慣例

1. DELEGATE 自 skill 根目錄執行 `python scripts/detect_project_convention.py --repo <專案根>`；非 git repo 或腳本失敗時停止並回報。
2. THINK 依 JSON 的 `recommendation` 決定 type/scope 約束：`FOLLOW_DETECTED_CONVENTION` 採 `detected_type_enum`／`detected_scope_enum`（空則預設 11 type）；`NO_HISTORY_USE_ANGULAR_DEFAULTS` 用 Angular 預設；`NO_ESTABLISHED_CONVENTION_PROPOSE_DEFAULTS` 用標準格式並可簡述；`GITMOJI_STYLE_DETECTED_ASK_USER` 與 `MIXED_HISTORY_ASK_USER_OR_USE_MAJORITY` 依 Phase 5 規則處理。

## Phase 1 -- 蒐證與阻斷條件

1. DELEGATE 自 skill 根目錄執行 `python scripts/analyze_git_changes.py --repo <專案根>`；若腳本不可用，平行執行 `git status` 與 `git diff`／`git diff --staged` 作為 fallback。
2. READ 讀取 `rules/Rule-Commit-阻斷與安全.md`；依已載入規則處理阻斷項與分析範圍，必要時補讀單檔完整 diff。
3. THINK 確認可進入 Phase 2 的 diff 集合與 branch 線索（如 `issue_refs_from_branch`）；若無法繼續則 WRITE 向使用者說明原因並停止。

## Phase 2 -- 意圖與 atomic 拆分

1. READ 讀取 `rules/Rule-Commit-TypeScopeBreaking.md` Rule 3，對各變更整理 what／why。
2. READ 若變更可能需多 commit，讀取 `rules/Rule-Commit-Atomic拆分.md` 與 [decision-trees.md](references/decision-trees.md)「Atomic 拆分」。
3. THINK 判定單 commit 或拆分；若拆分，READ `templates/split-plan.md` 與 `templates/split-plan.example.md`。
4. WRITE 若需拆分，依模板產出計畫並進入 Phase 5；若單 commit，記錄本 commit 的檔案範圍供 Phase 6 使用。

## Phase 3 -- 組裝訊息

1. READ 讀取 `rules/Rule-Commit-TypeScopeBreaking.md` Rule 1–2 與 [decision-trees.md](references/decision-trees.md) 的 Type／Scope／Breaking 章節。
2. READ 讀取 `rules/Rule-Commit-訊息格式.md` Rule 1，撰寫 subject／body／footer。
3. WRITE 將完整訊息寫入暫存檔（無 BOM），供 Phase 4 與 Phase 6 共用；多 commit 時對每一 commit 重複 Phase 3–7 迴圈。

## Phase 4 -- 驗證訊息

1. DELEGATE 自 skill 根目錄執行 `python scripts/validate_commit_message.py --file <暫存訊息檔> [--types <Phase0 逗號清單>] [--scopes <Phase0 逗號清單>]`。
2. READ 讀取 `rules/Rule-Commit-訊息格式.md` Rule 2；`valid: false` 須修正後重跑 DELEGATE，不得進入 Phase 6。

## Phase 5 -- 人類確認閘

1. READ 讀取 `rules/Rule-Commit-人類確認.md`；命中 MUST 確認情境時 WRITE 向使用者呈現 message、檔案範圍、拆分計畫或慣例衝突，**等待明確同意**後才可 Phase 6。
2. THINK 若使用者僅要 message 草稿，依 Rule 3 停止於 Phase 4 產出即可。

## Phase 6 -- staging 與 git commit

1. READ 再次讀取 `rules/Rule-Commit-阻斷與安全.md` Rule 3；依計畫精準 `git add`、 `git diff --staged` 確認範圍。
2. WRITE 執行 `git commit -F <暫存訊息檔>`；hook 失敗時依 Rule 3 修正訊息重試，不用 `--no-verify` 除非 Phase 5 已確認。

## Phase 7 -- 事後驗證與回報

1. DELEGATE 執行 `git log -1 --stat`，核對 SHA、檔案清單與 hook 結果。
2. READ 讀取 `templates/commit-report.md` 與 `templates/commit-report.example.md`。
3. WRITE 依模板向使用者回報（含 semver 影響、未完成變更、多 commit 序列）；使用者僅要 message 時改為呈現草稿與驗證結果即可。

## 驗證與異常

- hook 失敗、慣例衝突、密鑰、歷史改寫：依 `rules/Rule-Commit-阻斷與安全.md` 與 [anti-patterns.md](references/anti-patterns.md)；使用者問「這樣寫對嗎」時 READ anti-patterns／[examples.md](references/examples.md)。

## 補充資源

| 檔案 | 何時 READ |
|---|---|
| [glossary.md](references/glossary.md) | 術語速查 |
| [spec.md](references/spec.md) | 完整規範、commitlint 對照 |
| [tooling.md](references/tooling.md) | `-F` vs `-m`、hunk staging、BOM |
| [anti-patterns.md](references/anti-patterns.md) | 錯誤案例與修正 |
| [examples.md](references/examples.md) | 行為校準（含 gitmoji、無變更） |
| [decision-trees.md](references/decision-trees.md) | Type／scope／breaking／拆分樹 |
| `scripts/*.py` | Phase 0／1／4 證據與驗證 |
