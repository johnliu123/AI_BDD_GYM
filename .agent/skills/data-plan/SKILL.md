---
name: data-plan
description: "分析資料相關端點（資料庫、檔案／物件儲存、持久化邊界），產出或更新 DBML 文件 data-model.dbml。通常由 /system-analysis 依 plan.md 的 Wave 委派；同一 Wave 多個資料端點可合併為一次委派。Use when planning data persistence from a spec or delegated endpoint analysis."
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Data Plan

分析**資料端點**（關聯式／文件資料庫、檔案與物件儲存、必要時的快取或索引邊界）：只產出 **DBML** 資料模型文件，不實作 migration、不設計 HTTP API 或 UI 流程。若由 `/system-analysis` 委派，僅覆蓋委派指令中的端點與分析邊界；多個資料端點寫入同一 `data-model.dbml` 時須在同一委派內逐端點完成（關聯式 schema 用 `Table`；檔案／物件儲存等非關聯端點寫入 `Project` Note 或註解分節）。

## SOP

### Phase 1 -- 確認輸入與分析邊界

1. READ 讀取功能規格、`plan.md`、研究文件、委派指令中的端點清單（如 MySQL、私有檔案儲存）與分析邊界，以及前置產物；若 `data-model.dbml` 已存在，先讀取以便整合。
2. READ 讀取 `rules/Rule-Data-分析邊界與追溯.md`。
3. THINK 區分結構化中繼資料與二進位／檔案儲存責任；對齊 plan 中的設計決策（transaction、清理、排序持久化等）。
4. THINK 高影響缺口（實體歸屬、唯一性、生命週期、合規刪除）無法安全假設時，透過 `/clarify` 收斂後再繼續。

### Phase 2 -- 分析資料模型與儲存

1. THINK 列出核心實體、關係、識別鍵、唯一性與不變量；對應規格實體與需求部位。
2. THINK 為每個受派端點描述 schema 或儲存布局（表／集合、目錄結構、命名慣例）、讀寫模式與 transaction 邊界；MySQL 等特殊限制須寫入設計備註。
3. THINK 描述檔案生命週期：暫存、提交、失敗清理、預覽衍生檔與原始檔關係；不描述 HTTP 如何傳輸。
4. THINK 記錄與其他端點的介面假設（供 API Plan 使用），以資料視角陳述（例如「順序以 0..n-1 整數持久化」），不撰寫路由。

### Phase 3 -- 產出 data-model.dbml

1. THINK 依專案慣例或委派指令決定輸出路徑；預設與 `plan.md` 同目錄下的 `data-model.dbml`。
2. READ 讀取 `templates/data-model.template.dbml` 與 `templates/data-model.example.dbml`，確認 `Project` 追溯註解、表結構、`Ref`／索引與非關聯端點 Note 的寫法。
3. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`data-model.dbml`）。
4. WRITE 依模板撰寫有效 DBML；補齊 `Table`／`indexes`／`Ref`，移除所有 `{{}}` 佔位符；檔案儲存等端點寫在 `Project Note` 或 `//` 分節；產物 MUST 以憲法為最高優先。
5. WRITE 整合既有內容時保持單一一致模型；衝突須釐清，不得靜默覆蓋。

### Phase 4 -- 驗證並交付

1. READ 對照規格、委派邊界與 plan 設計決策，確認每個受派資料端點皆有分析，且未寫入 API 或 UI 細節。
2. THINK 檢查實體與儲存決策可支援 plan 中的持久化與失敗處理敘述。
3. EXEC **Phase Self-check**（artifact=`data-model.dbml`）。
4. WRITE 回報產物路徑、涵蓋端點、待確認事項、供 `/api-plan` 參考的關鍵持久化契約摘要，以及 `Constitution self-check: pass` 或 `exceptions`（格式見 artifact-overlay-sop）。
