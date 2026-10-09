# Rule 1 - 技術研究產物為系統分析前置條件

- Level: `MUST`
- 開始 Phase 2（規劃端點與 Wave）前，須在 **`spec.md` 所在目錄**（或使用者明示的 feature 目錄）確認存在且可讀：
  - `research.md`（`/technical-research` 決策詳述）
  - `techstack.md`（採用技術堆疊摘要）
- 任缺其一：**STOP**，回報缺失檔名，並請使用者先執行 **`/technical-research`** 或提供兩檔的完整路徑；不得臆測技術選型以撰寫 `plan.md` 或啟動 Phase 4 委派。
- **豁免**：僅當使用者**明示**「本功能無需技術研究」（例如沿用既有專案堆疊且規格已列明全部技術限制）時，可跳過；須在交付回報中記錄豁免理由，且 `plan.md` 的設計決策須能追溯到規格或既有專案文件，不得空白。

## Good Example

- `specs/001-foo/spec.md` 同目錄已有 `research.md`、`techstack.md` → 進入 Phase 2 盤點端點。

## Bad Example

- 只有 `spec.md` 就產出 `plan.md` 並委派 `/api-plan`，假設「大概用 Express + MySQL」。

# Rule 2 - 委派與整合驗收須引用研究產物

- Level: `MUST`
- Phase 4 每項委派指令的輸入清單須包含 **`spec.md`、`plan.md`、`research.md`、`techstack.md`**（路徑以 feature 目錄為準）。
- Phase 5 整合驗收時，須抽查 `plan.md` 設計決策與 `research.md` 已採用決策一致；矛盾不得自行選邊，應 `/clarify` 或回 `/technical-research` 更新後再驗收。
