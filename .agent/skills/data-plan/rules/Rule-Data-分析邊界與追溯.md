# Rule 1 - 只分析資料與持久化

- Level: `MUST`
- 本 Skill 產出 **DBML**（`data-model.dbml`）：以 `Table`／`Ref`／`indexes` 描述結構化持久化，並以 `Project Note` 或註解描述檔案儲存、transaction、不變量與清理策略；不得定義 HTTP 路由、UI 元件或前端狀態機。
- 對外暴露資料的**方式**（REST、GraphQL 等）屬 `/api-plan`；本 Skill 可描述資料契約（欄位語意、不變量）供 API 對齊。

## Good Example

- 「`album_photos.position` 在同一 `album_id` 內唯一，取值 0..n-1；重排時在 transaction 內先移至暫存偏移再寫回最終序。」

## Bad Example

- 「前端拖放後呼叫 reorder API，回 200 即成功。」

# Rule 2 - 多端點合併與追溯

- Level: `MUST`
- 同一 `data-model.dbml` 內，每個受派端點（如 MySQL、私有檔案儲存）須有獨立分節（`Table` 或 `Project Note`／註解區塊），並在 `Note` 或註解中標示需求追溯。
- 不得新增規格未要求的實體或儲存桶；第三方資料服務若被委派分析，須在邊界內只描述與本功能相關的持久化介面。

# Rule 3 - 與 plan 設計決策一致

- Level: `MUST`
- `plan.md` 中已確認的資料相關設計決策（transaction、失敗清理、排序演算法約束等）須在 DBML（表 `Note`、欄位 `note` 或 `Project Note`）中體現；衝突時不得自行改決策，應 `/clarify` 或標示阻塞。
