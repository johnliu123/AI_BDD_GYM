# Rule 1 - Phase 與任務順序

- Level: `MUST`
- 須依 `tasks.md` 的 Phase 編號順序執行；完成當前 Phase 的 Checkpoint（若有）後再進入下一 Phase。
- 同一 Phase／User Story 內按 **T 編號升序** 執行，並遵守 tasks 的 **Dependencies & Execution Order**（若有）；標記 `[P]` 者依 Rule 2 可平行。
- 若 `tasks.md` 區分 **Tests** 與 **Implementation** 小節，仍依 **整體 T 編號與 Dependencies** 為準，不另加與 tasks 無關的強制順序。

# Rule 2 - 平行 [P] 與同檔案序列

- Level: `MUST`
- 標記 `[P]` 的任務僅在 **目標檔案路徑互不衝突** 且 **無未完成任務依賴** 時可平行。
- 多任務修改同一檔案須 **序列** 執行，不得平行。
- 非 `[P]` 任務失敗須 **halt** 當前 Phase 的後續依賴任務，並報告；`[P]` 任務部分失敗時繼續其餘 `[P]` 任務並彙總失敗項。

# Rule 3 - 驗證與 Checkpoint

- Level: `MUST`
- 單一任務完成條件以 **該 T 描述** 為準（程式／測試／文件等）；若描述要求執行命令或走查，完成後須執行並記錄結果。
- **Checkpoint** 段落：依 `tasks.md` 記載執行該 Phase／User Story 的最小驗證（測試、build、smoke 或走查步驟）。
- Polish Phase：依 tasks 必讀對照與 `quickstart.md` 執行 build／smoke（若 tasks 列出）。

# Rule 4 - 任務完成標記

- Level: `MUST`
- 任務交付物與該 T 要求的驗證完成後，須在 **FEATURE_DIR 下的 `tasks.md`** 將該行 `- [ ]` 改為 `- [x]`（保持 T 編號與其餘文字不變）。
- 不得在未完成該 T 描述之工作前標記為完成。

# Rule 5 - 實作邊界

- Level: `MUST`
- 只實作 `tasks.md` 與已 READ 錨點所覆蓋的行為；不得擴大 spec 未確認範圍。
- 錨點與程式衝突時 STOP，（`/clarify` 或更新分析產物後）再改程式，不得自行選邊。
