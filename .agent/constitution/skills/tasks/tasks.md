# Artifact: tasks.md

skill: tasks  
overlay: true

## MUST

- 文件含 **Spec 套件索引** 與 Phase 1 **Read when executing this phase**（與 `Rule-Tasks-端點分層與按需讀取.md` 一致）。
- 每個有任務的 `####` 端點小節（含 Phase 1–2）開頭有 **必讀對照** 四欄表；User Story 依實際任務端點分節，不建立空小節或混合 codebase。
- 每個 `- [ ] Tnnn` 行尾含 **`←`** 機器錨點；必讀對照**每一列**至少被一個任務引用。
- 每個行為任務恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 標籤，且追溯至少一個 `testplan:TP-xxx`；每個 testplan 案例至少被一項任務引用。
- 純文件／環境準備等非行為任務標示 `[NON-TDD]` 並說明原因；不得以此標示產品行為實作。
- User Story 內依 TP 案例交錯 RED、GREEN 與可選 REFACTOR 任務；不得將所有測試任務與所有實作任務分成會破壞逐案例紅綠順序的區塊。

## MUST NOT

- 要求「開始前讀完 spec 套件全文」作為 Prerequisites（須按需 READ）。
- 後端實作任務無 `openapi:` 錨點、持久化任務無 `dbml:` 錨點（若該 US 確有對應契約／模型）。
- 任務不得合併 RED／GREEN／REFACTOR 多個步驟，也不得新增未由 `testplan.md` 支持的行為任務。

## 交付自檢（Agent）

- [ ] shared（繁中、追溯 ID）已滿足
- [ ] Binding 雙向覆蓋（對照表列 ↔ 任務 `←`）已檢查
- [ ] TP-to-task 覆蓋完整；行為任務步驟標籤與 NON-TDD 豁免均正確
- [ ] Format Validation 段落存在且與 template 一致
