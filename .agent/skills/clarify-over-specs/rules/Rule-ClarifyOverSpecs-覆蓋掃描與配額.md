# Rule 1 - 必須依 taxonomy 對 spec 做覆蓋掃描

- Level: `MUST`
- 掃描時必須逐類標記 **Clear**（已足夠且可驗收）、**Partial**（有提及但缺決策或不可測）、**Missing**（規格應有卻未覆蓋）。
- 覆蓋地圖供內部排序用；除非無任何可問的高影響題，否則不必整張輸出給使用者。
- 掃描分類至少包含：
  - **功能範圍與行為**：核心目標、成功判準、明確 out-of-scope、角色／persona 差異
  - **領域與資料模型**：實體、屬性、關係、唯一性、生命週期／狀態、規模假設
  - **互動與 UX 流程**：關鍵旅程、錯誤／空／載入狀態、無障礙或在地化（若相關）
  - **非功能品質**：效能、擴展、可靠度、可觀測性、安全與隱私、合規
  - **整合與外部依賴**：外部 API、失敗模式、匯入匯出格式、協定／版本
  - **邊界與失敗處理**：負向情境、限流、並發／衝突解決
  - **限制與取捨**：技術或產品約束、已拒絕的替代方案
  - **術語與一致性**： glossary、同義詞衝突
  - **完成信號**：驗收可測性、DoD 類指標
  - **假設與占位**：TODO、待確認假設、未量化的模糊形容詞（如「快速」「直覺」且無 NFR/SC 判準）

## Good Example

- 這個例子是好的，因為它對「假設」與 FR 交叉檢查，並標記 Partial。

```text
假設：「缺少日期時的歸類方式待確認」但 FR-002 已寫死行為 → Partial（假設未同步移除）
整合：未提及離線或匯出 → Missing（若使用者描述曾提到備份則升級為 Partial）
```

## Bad Example

- 這個例子是壞的，因為只掃描 FR 標題，未看假設、邊界與 SC 是否一致。

```text
看過 FR 列表，覺得夠了，開始問使用者要不要用 React。
```

# Rule 2 - 候選題必須依 Impact × Uncertainty 排序且 session 最多 5 題

- Level: `MUST`
- 只保留答案會 **materially** 影響功能範圍、核心流程、資料歸屬、角色權限、驗收／GWT、可觀察 UX 或領域 BR 的候選題。
- 整個 clarify-over-specs session 透過 `/clarify` 累計最多 **5** 題；同一題的 disambiguation 不計入新題。
- 若 Partial/Missing 超過配額，依 Impact × Uncertainty 取前 5；其餘在結束報告標 **Deferred** 並簡述理由。
- 不得為問而問：正文與 `## 澄清紀錄` 已拍板的決策視為 Clear，不可重問。

## Good Example

- 這個例子是好的，因為它先問會改變 FR-002 與邊界驗收的日期缺失策略，再問低影響的文案。

```text
候選 1（高）：缺少拍攝日期是否允許多個「未知」相簿？→ 保留
候選 2（低）：空狀態按鈕文字 → Deferred 至實作/UI plan
```

## Bad Example

- 這個例子是壞的，因為在 5 題配額內問了多個低影響細節，卻未處理安全或資料唯一性缺口。

# Rule 3 - 與 specify 寫前 clarify 及 technical-research 的分工

- Level: `MUST`
- **寫前 `/clarify`（specify Phase 1）**：只處理「不澄清就不能寫 spec」的硬缺口；本 skill 不重做該階段已確認的決策。
- **本 skill**：針對已寫入 spec 的全文健檢、假設升級、跨章節矛盾、Partial/Missing 的產品／領域決策。
- **Deferred → `/technical-research`**：架構選型、函式庫版本、部署拓撲、未在 spec 承諾且不改變驗收的純技術 NFR 數字；結束報告必須列出，且不佔 5 題配額。

## Good Example

- 這個例子是好的，因為效能目標未寫入 spec，標 Deferred 交 research 比較方案。

```text
taxonomy NFR-效能：Missing 具體 latency → Deferred（spec 無 SC/NFR 承諾，research 再定）
taxonomy 權限：Partial「管理員可刪除」但未定義角色 → 候選澄清題
```

## Bad Example

- 這個例子是壞的，因為在 clarify-over-specs 中要求使用者選 PostgreSQL 版本，卻未改變任何 FR 或驗收。

# Rule 4 - 委派 clarify 時必須帶入已排序的缺口包

- Level: `MUST`
- 呼叫 `/clarify` 時必須提供：本輪 1 至 3 個缺口摘要、spec 引用片段、taxonomy 分類、session 已用題數。
- 不得只下達「請澄清這份 spec」而不指明缺口；`/clarify` 負責 Context、Options 與推薦，本 skill 負責掃描與排序。
- 詳記 `clarify-log.md` 為可選；預設僅維護 spec 內 `## 澄清紀錄`。

## Good Example

```text
缺口 COS-1 [領域與資料]：假設第 3 點與 FR-002 對「日期未知」相簿數量不一致。
請依 clarify 規則出題；本 session 已用 0/5 題。
```

## Bad Example

```text
請看一下 spec.md 有什麼要問的。
```
