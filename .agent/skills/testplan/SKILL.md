---
name: testplan
description: "在系統分析完成後，依 User Story 與 FR/NFR 規劃測試案例；測試入口只取自 system-analysis 產物，產生可供 /tasks 追溯的 testplan.md。"
---

# Test Plan Engineering

在 `/system-analysis` 之後、`/tasks` 之前，依 `spec.md` 的 User Story、驗收條件、FR、NFR、BR 與 SC 制定獨立 `testplan.md`。以 User Story 為主要分組，涵蓋適用的 FR 與 NFR，並以 `TP-xxx` 案例 ID 提供後續任務的穩定追溯點。

此 skill 規劃測試，不撰寫測試程式、不執行 RED／GREEN／REFACTOR、不修改 `/tdd`，也不取代其單一垂直切片流程。單一小型 bug 或已存在且未受需求變更影響的測試計畫，不必強制重做完整計畫。

## 通用約束

以下約束適用於所有 Phase，各步驟不再重述：

1. **系統規劃權威**：端點、系統邊界、資料責任、API operation、UI seam、測試入口與環境前置，必須依據 `plan.md` 及其 system-analysis 產物；不得自行推導或重新設計。
2. **需求語意權威**：需求語意以 `spec.md` 為準；規格未定義的 NFR 門檻不得自行發明。
3. **缺口處理**：若必要產物缺漏、彼此矛盾或沒有支持所需測試入口，記錄缺口並停止受影響的規劃，交由上游補齊。

## SOP

### Phase 1 -- 界定需求與介面範圍

1. READ 確認 feature 目錄含 `spec.md`、`plan.md` 及 system-analysis 指定的端點產物；讀取 `spec.md` 的 User Story、驗收、FR／NFR／BR／SC，讀取 `plan.md` 的需求端點盤點、設計決策與委派輸出路徑。
2. READ 按 `plan.md` 指定的路徑讀取相關 `ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml` 或其他分析產物；測試工具、環境與命令只讀取分析產物指定的研究／堆疊來源及必要的既有測試入口。
3. THINK 以 system-analysis 既有責任邊界整理測試範圍（通用約束 §1）；缺少必需 seam、契約或測試入口時依通用約束 §3 處理。
4. THINK 以 User Story 作為主要分組，為每個故事關聯驗收情境、FR／BR／SC 和適用 NFR；跨故事 NFR 另建全域追溯表，並連回故事及案例。
5. THINK 區分納入／排除範圍及未決事項。

### Phase 2 -- 推導案例與測試分工

1. READ 依每個 User Story 讀取其 spec 驗收情境與需求 ID，並核對 `plan.md` 指定的端點分析產物；只追查理解案例及測試入口所需的來源。
2. THINK 將故事需求拆成單一主要測試意圖；每案指定唯一 `TP-xxx`、需求追溯 ID、測試層級、public seam、優先級及完整 Arrange／Act／Assert。**Assert 必須標註驗證層標記**，標記定義如下：

   | 驗證層標記 | 含義 |
   |---|---|
   | `[response]` | 只驗證 API／UI 回應格式與值 |
   | `[response+state]` | 驗證回應 + 讀回持久化狀態 |
   | `[response+side-effect]` | 驗證回應 + 副作用（日誌、事件等） |
   | `[state-only]` | 不驗回應，只驗最終狀態 |
   | `[idempotent]` | 驗證重複操作產出相同結果 |

   不同主要操作、失敗原因或預期須拆案。
3. READ／THINK 測試入口必須能回溯到 system-analysis 產物：UI 指定頁面／元件與使用者操作；HTTP 指定 method、path 與 `operationId`；Service／Repository、事件、job、CLI 僅在分析產物明確列出時作為 seam。不得以 internal call 當通過條件或自行杜撰入口。
4. THINK 案例依 User Story 分組；跨端點旅程另列整合案例，並回連適用故事與需求。每個 FR／NFR 中屬於本次範圍者，至少有案例或明確排除／待釐清理由。
5. THINK 建立全域 NFR 對照表，列出 NFR 原文語意、適用故事、TP 案例與可觀察驗收方式。沒有來源定義的數值門檻不得補造；若無法形成可判定案例，列為待確認。
6. THINK 建立具名 fixture 目錄；案例 Arrange 明列初始狀態、關聯、身份／session／角色、stub／clock 及隔離方式，不依賴案例執行順序。

### Phase 3 -- 產生並檢查 testplan.md

1. READ 讀取 [testplan template](./templates/testplan.template.md) 與 [完成範例](./templates/testplan.example.md)，並讀取憲法 overlay 規範；EXEC **Phase Load**（artifact=`testplan.md`）。
2. THINK 輸出固定為 `spec.md` 所在 feature 目錄內的 `testplan.md`；若使用者指定目錄外路徑，先確認後續 `/tasks` 可讀取該路徑並保留相同 TP 錨點，否則停止並釐清。
3. WRITE 依 User Story 建立／更新完整 `testplan.md`，含需求範圍、分析來源、FR／NFR 追溯、測試策略、案例（含驗證層標記）、具名 fixture、環境及新 session 入口；**初始化第 10 節「執行狀態追蹤」，所有 TP 狀態為 ⬜ 未執行**；**初始化第 11 節「AI 自主決策與發現紀錄」為空表**；未執行案例不得標示為已通過。
4. THINK 對照 spec 與 system-analysis 產物逐項檢查：需求追溯完整、每案唯一 TP ID、案例分組於故事、seam 來自分析產物、Arrange／Act／Assert 可判定且 Assert 含驗證層標記、fixture 可重現、NFR 有驗證或明確待確認，且未自行新增系統規劃。
5. EXEC **Phase Self-check**（artifact=`testplan.md`）。

### Phase 4 -- 審閱並交接 TDD

1. WRITE 向使用者摘要計畫路徑、涵蓋的介面／功能、P0 風險與待決事項，提供 `testplan.md` 審閱。
2. THINK 若使用者指出測試範圍、案例結構或驗收語意需調整，更新計畫並重新檢查追溯；在高影響差異解決前，不宣稱計畫已核准。
3. WRITE 計畫審閱後，交接給 `/tasks`；tasks 必須引用每個 TP 案例，並將行為開發拆為單步 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 任務。
4. THINK `/implement` 對 TDD 標記任務逐項呼叫 `/tdd` 並傳入明確步驟及 **`testplan.md` 路徑**；本 skill 不執行測試程式撰寫或 RED／GREEN／REFACTOR。
5. THINK 新 session 執行時，先讀第 7 節「快速狀態摘要」與第 10 節「執行狀態追蹤」定位進度；若來源語意、分析入口、案例目標或高影響事項已改變，先停止並更新／確認 testplan；不得自行改寫案例意圖。