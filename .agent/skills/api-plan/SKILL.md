---
name: api-plan
description: "分析後端 API 與通訊協定端點，產出 contracts 下的 OpenAPI 3 文件（如 http-api.yaml）。通常由 /system-analysis 在取得 ui-plan 與 data-model.dbml 等前置產物後委派。Use when designing HTTP/API contracts from spec, plan, and upstream analysis artifacts."
---

# API Plan

分析**後端 API、通訊協定與外部 HTTP 整合**端點：只產出 API 契約文件，不實作路由或 handler、不撰寫 UI 或 DB migration。須整合前置 Wave 的 `ui-plan.md`、`data-model.dbml` 等產物。若由 `/system-analysis` 委派，以委派中的分析邊界為準。

## SOP

### Phase 1 -- 確認輸入與前置產物

1. READ 讀取功能規格、`plan.md`、研究文件、委派指令，以及 plan 要求的前置分析產物（通常含 `ui-plan.md` 與 `data-model.dbml`）；缺任一必要前置時停止並回報，不得臆測補寫。
2. READ 讀取 `rules/Rule-API-分析邊界與追溯.md`。
3. THINK 對照 ui-plan 流程與 data 契約，列出 API 須支撐的操作與整合邊界（認證、CORS/Origin、錯誤格式等）。
4. THINK 高影響缺口（幂等、分頁、上傳協定、錯誤碼策略）無法對齊規格或前置產物時，透過 `/clarify` 收斂。

### Phase 2 -- 設計 API 契約

1. THINK 依資源與使用者操作劃分端點群組；每個端點須對應可追溯的需求或 ui-plan 流程步驟。
2. THINK 定義方法、路徑、請求／回應 schema、狀態碼與錯誤語意；與 `data-model.dbml` 欄位與不變量一致，並以 OpenAPI 3 的 `components.schemas` 重用模型。
3. THINK 描述與前端、檔案儲存、第三方服務的整合點（如 multipart 上傳、預覽串流、Origin 驗證）；不重复撰寫完整 UI 或 schema 定義，以引用或摘要對齊。
4. THINK 記錄安全與本機部署相關約束（如精確 Origin 檢查、loopback 綁定）來自 plan 或規格。

### Phase 3 -- 產出 API 文件

1. THINK 依專案慣例或委派指令決定輸出路徑；預設為與 `plan.md` 同目錄下 `contracts/http-api.yaml`（OpenAPI 3.0.3；目錄不存在則建立）。
2. READ 讀取 `templates/http-api.template.yaml` 與 `templates/http-api.example.yaml`，確認結構、追溯欄位（`info`、`x-contract-metadata`、`x-errorCases`）與 schema 粒度。
3. WRITE 依模板撰寫有效 OpenAPI 文件；補齊 `paths` 與 `components`，移除所有 `{{}}` 佔位符與空 schema。
4. WRITE 若檔案已存在，讀取並整合；與 data-model.dbml 衝突須釐清。

### Phase 4 -- 驗證並交付

1. READ 對照規格、前置 ui-plan／data 產物與 API 文件，確認每個受派後端操作皆有契約，且流程可端到端走通（概念上）。
2. THINK 檢查錯誤與失敗路徑與 plan 設計決策一致（如逐檔上傳失敗、transaction 失敗時客戶端可見行為）。
3. WRITE 回報產物路徑、端點清單摘要、待確認事項與已知限制。
