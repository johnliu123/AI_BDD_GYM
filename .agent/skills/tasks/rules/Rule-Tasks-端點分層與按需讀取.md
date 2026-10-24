# Rule 0 - Plan／Truth 與 truth-delta 必讀

- Level: `MUST`
- `PLAN_DIR` = `specs/plans/<id>/`；`TRUTH_ROOT` = `specs/truth/`（見 `references/plan-truth-workflow.md`）。
- 產出 `tasks.md` 前 MUST READ `PLAN_DIR/truth-delta.md` 全文；必讀對照表須含該檔與本 plan 觸及的 Truth 路徑。
- 介面 Feature／DSL、`openapi:`、`dbml:`、`techstack:` 錨點預設指向 **`TRUTH_ROOT`**；acceptance 指向 **`PLAN_DIR/features/acceptance/`**；traceability 指向 **`PLAN_DIR/traceability.md`**。

# Rule 1 - Feature File／User Story Phase 內依 plan 端點分層並保持 BDD／TDD 順序

- Level: `MUST`
- BDD 主模式 Phase 3 起**每個介面 Feature 檔一 Phase**（Phase 標題為 Truth 路徑，如 `` `specs/truth/features/backend/菜單/依分類讀取餐點.feature` ``）；Legacy 模式 Phase 3 起仍依 **User Story** 分 Phase。各 Phase 內依實際有任務的端點建立 `#### 前端`、`#### 後端` 或其他明確端點小節；不要求建立無任務的空小節，不得把不同 codebase 的任務混在同一小節。
- 每個 Feature File Phase 須有 `### {feature 檔 basename} 任務` 小節（其下再分端點 `####`）。
- BDD 主模式在全部 Feature File Phase 之後須有 **NFR 重構** Phase（可無額外 checkbox，但須保留引導與 Checkpoint 檢視結果）。
- 任務須落在實際會修改的 codebase 路徑下（如 `frontend/`、`backend/`）。
- BDD 模式中，同一 **Example**（或 Gherkin `Scenario:`）的 RED、GREEN、可選 REFACTOR 任務須依 T 編號與依賴順序排列；不得要求所有 Example 先完成 RED 才能開始 GREEN。
- BDD 模式每個行為任務只執行一個階段，恰有一個 `[BDD:RED]`、`[BDD:GREEN]` 或 `[BDD:REFACTOR]` 標籤；每個納入範圍的 Example 至少有 RED 與 GREEN 任務，REFACTOR 可省略。
- Legacy 模式每個行為任務只執行一個 TDD 步驟，恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 標籤；每個 TP 案例至少被一項 task 引用 `testplan:TP-xxx`。
- 同一份 tasks 不可混用 BDD 與 legacy TDD 模式。純文件／環境／walkthrough 等非行為任務標 `[NON-TDD]` 並說明原因，可出現在 Feature File Phase 內；行為任務必須追溯到所選模式的測試來源，不得自行新增無來源依據的行為。

## Good Example

- 同一 Example 的 BDD 階段分成獨立任務並依賴順序排列；Phase 標題為 Feature 檔路徑。

```md
## Phase 3: `specs/truth/features/backend/菜單/依分類讀取餐點.feature`
### 依分類讀取餐點.feature 任務
#### 後端
- [ ] T003 [US1] [BDD:RED] 接通 Example「顧客讀取菜單時餐點欄位對應正確分類」 ← `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; …
  完成條件：Example 因欄位或分類關聯不符合 Then 而失敗
- [ ] T004 [US1] [BDD:GREEN] 實作讓上述 Example 通過的最小行為 ← …
```

## Bad Example

- 同一份 tasks 混用 BDD 與 legacy TDD，或以 User Story 為 BDD Phase 3 標題，或將所有 RED 集中在所有 GREEN 之前。

```md
## Phase 3: User Story 1 - 瀏覽餐點
- [ ] T001 [BDD:RED] Example A
- [ ] T002 [BDD:RED] Example B
- [ ] T003 [BDD:GREEN] Example A
```

# Rule 2 - 測試來源必須依模式選取並按需讀取

- Level: `MUST`
- 文件開頭使用 **Spec 套件索引** 表格；不得用 Prerequisites 要求「開始前讀完全部」。
- Phase 1 必須有 **Read when executing this phase**，至少列 `research.md`（決策摘要）、`techstack.md`、`plan.md`；BDD 模式按需讀取 interface Feature、DSL 與 acceptance traceability，legacy 模式按需讀取 `testplan.md`。
- 進入某小節前，須先完成該小節 **必讀對照** 表格中每一列的 READ，再執行第一個 checkbox。

## Good Example

- BDD 任務只讀該 Example 的 Feature 與 DSL，並保留上游 traceability 路徑。

```md
**Read when executing this phase**：`truth-delta.md`、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`。
```

## Bad Example

- 無條件要求讀取不存在或非本模式使用的 testplan，或要求開始前讀完整個 spec package。

```md
**Prerequisites**：開始前讀完 `spec.md`、`testplan.md`、所有 Feature、所有 DSL 與全部分析文件。
```

# Rule 3 - 必讀對照必須使用可定位的雙軌錨點

- Level: `MUST`
- 每個有任務的 `####` 端點小節及 Phase 1–2 任務小節開頭，必須有 **必讀對照** 四欄表格：`文件`、`必讀部位（人讀）`、`機器錨點`、`本節任務須對齊`。
- 人讀部位須指出 Example 標題、Rule、驗收情境或決策條目；機器錨點至少一項，可用 `;` 分隔。同一 Feature 檔 Phase 的必讀對照可在一列中列出多個 `feature:#<Example 標題>`。
- 共用錨點包括 `spec:`、`plan:`、`research:`、`techstack:`、`openapi:`、`dbml:`、`ui-plan:`、`prototype:`；BDD 模式另用 `acceptance:<相對路徑>#<Example 標題>`、`feature:<相對路徑>#<Example 或 Scenario 標題>` 與 `dsl:<相對路徑>#<DSL 句型>`；legacy 模式用 `testplan:TP-xxx`。
- 每列的「本節任務須對齊」須描述具體技術或行為義務，不可只寫「見文件」。

## Good Example

- Feature 與 DSL 錨點可定位至單一 Example 和相關句型。

```md
| `features/backend/菜單/依分類讀取餐點.feature` | Example「顧客依分類檢視菜單」等 | `feature:features/backend/菜單/依分類讀取餐點.feature#顧客依分類檢視菜單`; `dsl:features/backend/菜單/dsl.md#顧客檢視分類 "{分類}" 的菜單` | 分類篩選 API 断言 |
```

## Bad Example

- 只列出路徑，沒有 Example 或契約定位資訊。

```md
| `features/`、`dsl.md` | 菜單 | `feature:features/`; `dsl:dsl.md` | 見文件 |
```

# Rule 4 - 任務 Binding 必須雙向覆蓋且符合所選模式

- Level: `MUST`
- 每個 `- [ ] Tnnn` 行尾必須有 `←` 與至少一個機器錨點；每列必讀對照至少由該小節一項任務引用，且每項任務均能回指來源。
- BDD 行為任務必須各自只有一個 BDD 階段標籤，並引用上游 `acceptance:` Example、`feature:` Example（或 Scenario）、相關 `dsl:` 句型及 `spec:` 需求錨點；每個納入範圍的 Example 至少有 RED 與 GREEN 任務。RED 任務另附「完成條件：…」，描述預期有效紅燈。
- BDD `[BDD:RED]` 任務描述可指定**過渡測試檔**（如既有 `*.test.js`）以接通 Example，但行尾 `←` 仍須含對應 `feature:#<Example 標題>` 與 DSL；**`[BDD:GREEN]` 完成條件 MUST 對齊 Truth Example Then**（Q2:A），不得以過渡檔断言取代。truth-delta 有 MOD/DEL 時 MUST 有 **Phase 2.5**（見 `Rule-Tasks-Truth-Delta-與-Harness-對齊.md`）。
- BDD 模式中，`spec.md` 範圍內每個可驗收的 FR／NFR／BR／SC 都必須在 acceptance traceability 中有對應且未標 unmapped／blocked，並由 interface Feature Example 與任務覆蓋；有缺口時不得繼續產出 tasks。
- Legacy 行為任務必須各自只有一個 TDD 階段標籤並引用 `testplan:TP-xxx`；每個 TP 至少被一項任務引用，RED 任務完成條件依該 TP 的 Assert 描述預期紅燈。
- 非行為任務標 `[NON-TDD]` 並說明理由。缺少已規劃的 API、資料模型或 UI 錨點時，不得自行發明任務，應先補分析產物或 `/clarify`。

## Good Example

- BDD 任務透過 acceptance Example、interface Example、DSL 與需求錨點連回必讀對照。

```md
- [ ] T003 [US1] [BDD:RED] 在 `backend/src/__tests__/menu-api.test.js` 接通 Example「顧客讀取菜單時餐點欄位對應正確分類」 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類.feature#顧客依分類瀏覽餐點並確認資訊相符`; `feature:features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `dsl:features/backend/菜單/dsl.md#菜單資料中有多個分類及其所屬餐點`; `spec:US1`
  完成條件：Example 因 GET 回應欄位／分類關聯不符合 Then 而失敗
```

## Bad Example

- BDD 任務仍必須引用 TP，或有 Example 沒有 GREEN 對應任務。

```md
- [ ] T001 [US1] [BDD:RED] 建立測試 ← `testplan:TP-001`
```

# Rule 5 - 任務端點必須對齊 system-analysis 盤點

- Level: `MUST`
- 產出 tasks 前須 READ `plan.md` 端點盤點；各 Feature File Phase（BDD）或 User Story Phase（legacy）標示的端點必須與盤點一致。
- BDD 模式 Phase 3 起建議排序：後端／契約相關 Feature Phase 先於前端呈現 Phase（除非 plan 或 traceability 明確要求相反順序）。
- 任務依實際 codebase 分節：後端 HTTP 對 **`TRUTH_ROOT/contracts/http-api.yaml`**（或 plan 明示），持久化對 **`TRUTH_ROOT/data/data-model.dbml`**，前端對 `PLAN_DIR/ui/`；其他端點依 system-analysis 指定產物。

## Good Example

- 前端與後端任務分列，並引用對應端點契約。

```md
#### 前端
- [ ] T015 [US1] [BDD:GREEN] 更新分類篩選 UI ← `feature:features/frontend/菜單/分類篩選.feature#顧客切換分類並辨識餐點資料`; `ui-plan:§畫面與流程`

#### 後端
- [ ] T004 [US1] [BDD:GREEN] 實作菜單讀取 API ← `feature:features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `openapi:listMenuItems`; `dbml:Table menu_items`
```

## Bad Example

- 把不同 codebase 的任務混在同一端點小節，或只依 Feature 所在目錄猜測實作責任。

```md
#### 前端
- [ ] T001 [US1] [BDD:GREEN] 同時實作 UI 與 API／資料庫 ← `feature:features/checkout.feature#成功`
```
