# Rule 1 - 只分析 API 與通訊邊界

- Level: `MUST`
- 本 Skill 產出 HTTP／RPC／Webhook 等**對外介面**契約；HTTP API 預設以 **OpenAPI 3.0.3 YAML**（`contracts/http-api.yaml`）撰寫。完整表結構與目錄布局以 `data-model.dbml` 為準，以 schema 與 `x-contract-metadata` 對齊，不重複定義矛盾模型。
- 不得描述畫面配置、CSS 或前端元件狀態；使用者可見結果以「回應欄位／狀態碼語意」對齊 ui-plan。

## Good Example

- 「`GET /api/albums` 回傳相簿列表含 `date_key` 與 `photo_count`，供主畫面相簿列表渲染。」

## Bad Example

- 「主畫面左側顯示側邊欄，點相簿後右側格狀顯示照片。」

# Rule 2 - 前置產物必讀

- Level: `MUST`
- 當 plan 或委派指令列出前置產物（通常 `ui-plan.md`、`data-model.dbml`）時，開始 Phase 2 前必須已讀取；API 設計須與兩者一致，發現矛盾不得選邊，應回報 System Analysis 或 `/clarify`。

# Rule 3 - 不擴規格

- Level: `MUST`
- 端點與欄位須可追溯至規格、plan 設計決策或前置分析；不得新增未確認的公開 API 或第三方整合。
