# Rule 1 - 委派必須攜帶可執行的分析上下文

- Level: `MUST`
- System Analysis 在 Phase 4 委派端點分析時，每項委派（或合併後的同 Wave 同 Skill 委派）必須明確提供：對應 skill id（`/ui-plan`、`/data-plan` 或 `/api-plan`）、受派端點名稱與分析邊界、本次 Wave 編號、輸出產物路徑、來源規格與 `plan.md` 路徑，以及計畫要求的前置分析產物路徑。
- 委派指令必須要求受派 Skill 完整執行其 SOP，不得只產出摘要或跳過模板與規則；對其產物須依 `.agent/constitution/references/artifact-overlay-sop.md` 執行 **Phase Load** 與 **Phase Self-check**，產物 MUST 以 `CONSTITUTION.md` 為最高優先（見 `artifact-authority.md`），交付回報須含 `Constitution self-check`。
- 若同一 Wave 內多個端點由同一 Skill 負責且輸出至同一產物檔，必須合併為一項委派，在指令中逐端點列出分析範圍，避免平行寫入同一檔案。

## Good Example

- 這個例子是好的，因為 skill id、端點、產物、前置輸入與邊界都清楚，且 MySQL 與私有檔案儲存合併為一次 Data Plan 委派。

```md
Wave 1 委派（合併）：
- Skill：`/data-plan`
- 端點：MySQL（相簿與照片中繼資料、排序持久化）；私有檔案儲存（原圖、預覽、暫存）
- 產物：`specs/001-photo-album-organizer/data-model.dbml`
- 輸入：spec.md、plan.md、research.md、techstack.md
- 前置：無
- 邊界：不設計 HTTP 路由；不描述 UI 元件細節
```

## Bad Example

- 這個例子不合格，因為未指定 skill id 與產物路徑，受派者無法判定輸出位置與職責。

```md
請分析資料庫並寫文件。
```

# Rule 2 - Wave 執行順序與失敗處理

- Level: `MUST`
- 必須依 `plan.md` 的 Wave 順序執行；開始 Wave N 前，必須已讀取並可提供 Wave N 所列的全部前置產物。
- 同一 Wave 內無檔案衝突的獨立委派可平行啟動 sub-agent；有前置依賴的 Wave 不得提前啟動。
- 某委派失敗、產物缺失或缺少必要輸入時，記錄原因並停止所有依賴該結果的後續 Wave；不得將未完成步驟標記為成功。

## Good Example

- Wave 2 的 API Plan 在 Wave 1 的 `ui-plan.md` 與 `prototype/` 與 `data-model.dbml` 就緒後才啟動；若 `data-model.dbml` 未產出，不啟動 API Plan 並在交付回報中標示阻塞原因。

## Bad Example

- 在 `ui-plan.md` 與 `prototype/` 尚未完成時仍啟動 API Plan，並假設「大致流程」補寫 API。

# Rule 3 - 專責 Skill 與端點對應

- Level: `MUST`
- 預設對應：前端與使用者介面 → `/ui-plan`；資料庫、檔案／物件儲存、快取持久化等資料端點 → `/data-plan`；後端 API、通訊協定、Webhook、第三方 HTTP 整合 → `/api-plan`。
- 金流、推播、硬體等非上述三類端點，依 Phase 2 在 `plan.md` 中記載的最接近 Skill 委派，並在委派指令中重述歸屬理由與分析邊界。
- System Analysis 不得代替專責 Skill 在分析產物中撰寫端點設計結論；整合驗收僅檢查一致性與覆蓋度，矛盾時觸發 clarify 或要求受影響 Skill 更新產物。
