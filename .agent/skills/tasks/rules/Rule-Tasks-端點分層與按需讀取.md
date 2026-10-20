# Rule 1 - User Story 內依 plan 端點分第二層並保持 TDD 順序

- Level: `MUST`
- Phase 3 起每個 User Story 下，依該故事實際有任務的端點建立 `#### 前端`、`#### 後端` 或其他明確端點小節；不要求建立無任務的空小節，不得把不同 codebase 的任務混在同一小節。
- 任務須落在實際會修改的 codebase 路徑下（如 `frontend/`、`backend/`）。
- 同一 TP 案例的 RED、GREEN、REFACTOR 任務須依 T 編號與依賴順序排列；不得要求所有故事先完成 RED 才能開始 GREEN。
- 每個行為任務只執行一個 TDD 步驟，恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 標籤；需要多步驟時拆成多個 task。純文件／環境等非行為任務標 `[NON-TDD]` 並說明原因。
- 所有行為任務必須追溯到 `testplan.md` 案例；每個 TP 案例至少被一項 task 引用 `testplan:TP-xxx`。

# Rule 2 - Spec 套件索引與按需讀取

- Level: `MUST`
- 文件開頭使用 **Spec 套件索引** 表格；不得用 Prerequisites 要求「開始前讀完全部」。
- Phase 1 必須有 **Read when executing this phase**（至少 `research.md`（決策摘要）、`techstack.md`、`plan.md`）。
- 進入某小節前，須先完成該小節 **必讀對照** 表格中每一列的 READ，再執行第一個 checkbox。

# Rule 3 - 必讀對照（Binding）雙軌錨點

- Level: `MUST`
- 每個 `#### 前端`／`#### 後端`（及 Phase 1–2 若列任務）小節開頭，必須有 **必讀對照** 表格，欄位固定為：

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|

- **人讀**：Markdown 標題路徑、User Story 名、驗收情境、設計決策條目等。
- **機器錨點**（至少填一類，可多個以 `;` 分隔）：
  - `spec:FR-001` / `spec:US1` / `spec:US1·情境2`
  - `testplan:TP-001`
  - `plan:設計決策·{關鍵字}` / `plan:端點盤點`
  - `research:{決策小節}`（對應 `research.md`「決策摘要」下 `###` 標題，如 `research:照片持久化`）
  - `techstack:{領域列}`（如 `techstack:backend`）
  - `openapi:{operationId}` 或 `openapi:{METHOD} {path}`（OpenAPI 須寫 operationId 若存在）
  - `dbml:Table {name}` / `dbml:Note:{小節標題}` / `dbml:Project`
  - `ui-plan:§{章節}` / `ui-plan:§{章}→{小節}`
  - `prototype:{檔名}`（如 `prototype:album.html`）
  - `openapi:components.schemas.{Name}`（共用 schema）
- **本節任務須對齊**：一句話說明該列技術義務（如「單檔匯入 201／400／413」），避免只寫「見 API」。

## Good Example

```md
| `contracts/http-api.yaml` | POST 匯入、相簿列表 | `openapi:importPhoto`; `openapi:listAlbums` | 匯入與列表契約 |
```

## Bad Example

```md
**References**: contracts/http-api.yaml, data-model.dbml
（未指定 operationId、Table 或 FR）
```

# Rule 4 - 任務行 Binding 與雙向覆蓋

- Level: `MUST`
- 每個任務行（`- [ ] Tnnn`）結尾必須有 **`←`** 後接至少一個機器錨點（與必讀對照表同語法），例如：  
  `← openapi:importPhoto; dbml:Table photos`
- 每個行為任務行須含唯一 TDD 步驟標籤，且至少有一個 `testplan:TP-xxx` 錨點；非行為任務用 `[NON-TDD]` 並說明原因，可不引用 TP 案例。
- 必須確認 testplan 中每個 TP ID 至少由一項 task 追溯；不得產生未經 testplan 規劃的行為任務。
- 必讀對照表中的**每一列**，至少被本小節**一個**任務行的 `←` 引用（雙向覆蓋：無孤兒列、無無錨點任務）。
- Setup／Foundational／Polish 任務同樣須帶 `←`（可引用 `research:`、`techstack:`、`plan:`、`dbml:` 等）。
- 若 User Story 需求在 spec 中存在，但 openapi／dbml／ui-plan **找不到對應錨點**，不得發明任務；先補分析產物或 `/clarify`。

# Rule 5 - 對齊 plan 端點盤點

- Level: `MUST`
- 產出 tasks 前須 READ `plan.md` 端點盤點；各 User Story 標 **端點（對齊 plan.md）**。
- 後端 HTTP 對 `contracts/http-api.yaml`；持久化對 `data-model.dbml`；前端對 `ui-plan.md` 與 `prototype/`。
