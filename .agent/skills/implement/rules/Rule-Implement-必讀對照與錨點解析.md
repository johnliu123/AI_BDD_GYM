# Rule 1 - 禁止開場讀完整包 spec

- Level: `MUST`
- Implement 開始時只 READ：`tasks.md`、使用者提供的 feature 路徑上下文；**不得**依 speckit 慣例一次載入 plan、spec、dbml、openapi、research、quickstart 全文。
- `tasks.md` 開頭 **Spec 套件索引** 僅作路徑字典；實際 READ 觸發點為 Phase 的 **Read when executing**、小節 **必讀對照**、任務行 **`←`**。

## Bad Example

- 開始 implement 前先讀完 `specs/001-foo/` 下所有 md/yaml/dbml。

# Rule 2 - 小節閘門與任務錨點

- Level: `MUST`
- 進入每個含任務的 `#### 前端`／`#### 後端`（及 Phase 1–2、Polish 的必讀對照區）前，須 READ 該小節 **必讀對照** 表格**每一列**的機器錨點（依 `references/anchor-resolver.md`）。
- 執行每個 `- [ ] Tnnn` 前，須解析並 READ 該行 **`←`** 所列錨點（與小節已讀錨點重複時須能對應到具體段落，不得空泛宣稱已讀）。
- 必讀對照列與任務 `←` 的格式須符合 `../tasks/rules/Rule-Tasks-端點分層與按需讀取.md`；Implement 不得弱化 Binding。

# Rule 3 - Feature 路徑

- Level: `MUST`
- 使用者須明確提供 **feature 目錄**（含 `tasks.md`）或 **`tasks.md` 的完整路徑**；未提供時 STOP 並請使用者提供，不得自動猜測最新 `specs/*/`
- `FEATURE_DIR` 定為 `tasks.md` 所在目錄；分析產物路徑均相對該目錄（如 `contracts/http-api.yaml`）。

# Rule 4 - Checklist 閘門（有則啟用）

- Level: `MUST`
- 僅當 `{FEATURE_DIR}/checklists/` 存在時：掃描其中所有 checklist 檔案的 `- [ ]` / `- [x]` 統計；若有未勾選項，展示表格並 **STOP**，詢問使用者是否仍繼續 implement（yes/no）；使用者 no/wait/stop 則 halt。
- 不得修改 checklist 檔案內容；`[x]` 僅表示需求／評審品質，不表示程式已完成。
- 若 `checklists/` 不存在，**跳過**本閘門，不視為 FAIL。
