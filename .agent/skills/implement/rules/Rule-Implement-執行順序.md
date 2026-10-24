# Rule 1 - Phase 與任務順序

- Level: `MUST`
- 須依 `tasks.md` 的 Phase 編號順序執行；完成當前 Phase 的 Checkpoint（若有）後再進入下一 Phase。
- 同一 Phase（Feature File、User Story 或 NFR 重構）內按 **T 編號升序** 執行，並遵守 tasks 的 **Dependencies & Execution Order**（若有）；標記 `[P]` 者依 Rule 2 可平行。
- BDD 任務依同一 **Example**（或 Scenario）的 RED → GREEN → 可選 REFACTOR 順序執行；GREEN 前須完成有效 RED，REFACTOR 前須確認 Example 通過。Legacy TDD 任務依同一 TP 的 RED → GREEN → 可選 REFACTOR 順序執行。
- Feature File Phase 內的 `[NON-TDD]` 任務依 T 編號執行，不得替代同 Example 尚未完成的 RED 或 GREEN。
- **NFR 重構** Phase 無 checkbox 時，仍須完成 Read when、必讀對照 READ 與 Checkpoint 檢視後再進下一 Phase。
- 若 `tasks.md` 區分 **Tests** 與 **Implementation** 小節，仍依 **整體 T 編號與 Dependencies** 為準，不另加與 tasks 無關的強制順序。

## Good Example

- 同一 Example 先完成 RED，再 GREEN，且在必要時才做 REFACTOR。

```text
T001 [BDD:RED] -> T002 [BDD:GREEN] -> T003 [BDD:REFACTOR]
```

## Bad Example

- GREEN 在 RED 完成前開始，或跳過對應階段前置。

```text
T001 [BDD:GREEN] -> T002 [BDD:RED]
```

# Rule 2 - 平行 [P] 與同檔案序列

- Level: `MUST`
- 標記 `[P]` 的任務僅在 **目標檔案路徑互不衝突** 且 **無未完成任務依賴** 時可平行。
- 多任務修改同一檔案須 **序列** 執行，不得平行。
- 非 `[P]` 任務失敗須 **halt** 當前 Phase 的後續依賴任務，並報告；`[P]` 任務部分失敗時繼續其餘 `[P]` 任務並彙總失敗項。

## Good Example

- 僅平行修改不同檔案且沒有未完成依賴的任務。

```text
T010 [P] 修改 frontend/A.ts；T011 [P] 修改 backend/B.ts
```

## Bad Example

- 兩個平行任務同時修改同一檔案。

```text
T010 [P] 修改 src/order.ts；T011 [P] 修改 src/order.ts
```

# Rule 3 - 驗證與 Checkpoint

- Level: `MUST`
- 單一任務完成條件以 **該 T 描述** 為準（程式／測試／文件等）；若描述要求執行命令或走查，完成後須執行並記錄結果。
- **Checkpoint** 段落：依 `tasks.md` 記載執行該 Phase 的最小驗證（測試、build、smoke 或走查步驟）。
- Polish Phase：依 tasks 必讀對照與 `quickstart.md` 執行 build／smoke（若 tasks 列出）。

## Good Example

- 執行 task 描述中的目標 Example／Scenario 測試（或 task 指定的過渡測試檔），記錄實際命令及結果。

```text
T002 要求驗證「有效訂單可建立」；只在 Scenario 執行且符合預期後完成該 task。
```

## Bad Example

- 只因程式已修改就略過 task 指定的驗證。

```text
修改完成，未執行指定測試，直接將 T002 標記完成。
```

# Rule 4 - 任務完成標記

- Level: `MUST`
- 任務交付物與該 T 要求的驗證完成後，須在 **FEATURE_DIR 下的 `tasks.md`** 將該行 `- [ ]` 改為 `- [x]`（保持 T 編號與其餘文字不變）。
- 不得在未完成該 T 描述之工作前標記為完成。

## Good Example

- 工作與必要驗證完成後，只將對應任務改為 `[x]`。

```md
- [x] T002 [BDD:GREEN] 實作最小行為
```

## Bad Example

- 尚未完成任務驗收就先勾選。

```md
- [x] T002 [BDD:GREEN] 尚未執行測試
```

# Rule 5 - 實作邊界

- Level: `MUST`
- 只實作 `tasks.md` 與已 READ 錨點所覆蓋的行為；不得擴大 spec 未確認範圍。
- 錨點與程式衝突時 STOP，（`/clarify` 或更新分析產物後）再改程式，不得自行選邊。

## Good Example

- 錨點與程式行為衝突時停止該任務並回報差異。

```text
Feature／DSL 預期狀態與既有 API 契約衝突 -> STOP -> 交由上游澄清
```

## Bad Example

- 自行忽略錨點或改寫驗收結果以配合目前程式。

```text
Feature 與程式不一致 -> 直接改 Feature 的預期結果 -> 繼續實作
```
