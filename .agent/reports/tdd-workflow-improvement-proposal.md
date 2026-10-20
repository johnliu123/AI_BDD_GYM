# AI × TDD Workflow 改進提案

**日期**：2026-10-21  
**範圍**：`/testplan`、`/tdd`、`/tasks`、`/implement` 及其交互流程  
**目標**：提高測試驅動開發的可靠度——讓 AI 少猜、讓測試真的證明功能、讓跨 session 可重現

---

## 目錄

1. [總覽：現有 Workflow 的核心可靠度風險](#1-總覽)
2. [改進 A：testplan 的 Assert 加入「驗證深度」標記](#改進-a)
3. [改進 B：/tdd RED 階段加入「測試意圖對齊」閘門](#改進-b)
4. [改進 C：/tdd GREEN 階段加入「Assert 符合度回報」](#改進-c)
5. [改進 D：testplan 增加「執行狀態追蹤」區段與回寫 SOP](#改進-d)
6. [改進 E：/tdd 補充 testplan 必讀指令，消除交接斷層](#改進-e)
7. [改進 F：testplan 增加「AI 自主決策紀錄」區段](#改進-f)
8. [改進 G：新 session 啟動摘要機制](#改進-g)
9. [改進 H：/tasks 的 RED 任務描述加入可驗證完成條件](#改進-h)
10. [改進 I：精簡或刪除重複的防護性文字](#改進-i)
11. [總結：改進優先級與預期效果](#總結)

---

## 1. 總覽

從 001–006 六個迭代的實際經驗，以及圖中提到的反思問題，歸納出現有 Workflow 在「可靠度」上的核心風險：

| # | 風險 | 現象 | 影響 |
|---|---|---|---|
| R1 | Assert 語意模糊 | testplan 的 Assert 欄寫「回 200；回應包含 fixture 中兩個分類」，AI 在 RED 時需自行猜測要驗證哪些欄位、是否要檢查持久化 | 測試可能只檢查回應格式，沒有驗證資料真的正確 |
| R2 | testplan → tdd 交接斷層 | `/implement` 把 TP-xxx 傳給 `/tdd`，但 `/tdd` SOP 沒有強制 READ testplan 的該筆案例 | AI 用自己理解的語意寫測試，可能偏離 testplan 本意 |
| R3 | 紅燈原因未對齊計畫 | `/tdd` Phase 2 只確認「測試失敗且原因是行為缺口」，不確認「失敗的 assertion 是否對準 testplan 的 Assert」 | 紅燈可能正確失敗，但測的不是計畫要測的東西 |
| R4 | 綠燈後無回報比對 | 測試通過後直接進下一步，沒有機制比對「實際寫的 assertion」和「testplan 的精確預期」 | 測試通過≠功能符合計畫。可能只通過了部分預期 |
| R5 | 無執行狀態回寫 | testplan 沒有標準化的執行結果追蹋區（001 有自行加的第 10 節，但 template 和 SOP 都沒有） | 新 session 不知哪些 TP 已通過、哪些失敗或未執行 |
| R6 | AI 決策不持久化 | AI 在 TDD 過程中發現新邊界、做了設計決定，這些散落在對話中不寫回文件 | 換一段對話就丟失，下次遇到相同情境重新猜 |
| R7 | 新 session 恢復成本高 | 只有「核對清單」沒有「快速狀態摘要」 | AI 需要大量 READ 才能恢復上下文，容易遺漏 |

---

<a id="改進-a"></a>
## 改進 A：testplan 的 Assert 加入「驗證深度」標記

### 要解決的問題

> 「有沒有只檢查回應，卻沒有確認資料或系統狀態真的正確？」（圖中反思問題）

目前 testplan 的 Assert 欄用自然語言描述預期結果，但沒有明確告訴 AI 「這個測試要驗證到什麼深度」。例如：

- TP-004 的 Assert 寫「回應及公開菜單均反映停供；持久化 `is_active=false`」
- 但 TP-001 的 Assert 只寫「寫入回應成功；公開菜單含新餐點」——需不需要驗證資料庫？

### 建議調整

在 testplan template 的案例表增加一個 **驗證層** 欄位（或在 Assert 欄用標準化前綴），明確標記每個案例需要驗證的層次：

```markdown
| 驗證層標記 | 含義 | 範例 |
|---|---|---|
| `[response]` | 只驗證 API/UI 回應格式與值 | 回 200 JSON；body 含 `id` 與 `name` |
| `[response+state]` | 驗證回應 + 讀回持久化狀態 | 回 200 且 `GET /api/menu-items` 反映新增 |
| `[response+side-effect]` | 驗證回應 + 副作用（日誌、事件等） | 回 500 通用 JSON；server log 含原始錯誤 |
| `[state-only]` | 不驗回應，只驗最終狀態 | 偽造金額不改變持久化計算結果 |
| `[idempotent]` | 驗證重複操作產出相同結果 | 重送相同 key 不新增第二筆 |
```

### 為什麼這樣改

- **減少 AI 猜測**：AI 看到 `[response+state]` 就知道 GREEN 不能只讓 response 正確就停手，還必須有讀回驗證。
- **提高測試品質**：避免「測試通過但功能其實有 bug」的情況——最常見的就是只測了回應碼但資料沒真的寫進去。
- **跨 session 可重現**：新 AI 讀到同一份 testplan，對驗證深度的理解一致。

### 預期效果

- 換一段新對話，AI 只讀 testplan 就能寫出符合原始意圖的測試，不需要前一段對話的上下文。
- 測試真的在驗證「功能做到了」，而不只是「API 有回應」。

---

<a id="改進-b"></a>
## 改進 B：/tdd RED 階段加入「測試意圖對齊」閘門

### 要解決的問題

> 「AI 能不能清楚知道要測什麼、怎麼測、怎麼判斷結果？」（圖中反思問題）

目前 `/tdd` 的 Phase 1 對齊的是「seam」和「slice」，但不會去讀 testplan 中該 TP 案例的具體 Arrange/Act/Assert。`/implement` 傳遞了 TP-xxx 資訊，但 `/tdd` SOP 中沒有一個步驟是「READ testplan.md 中 TP-xxx 的完整案例，並與我要寫的測試比對」。

### 建議調整

在 `/tdd` SKILL.md 的 **Phase 1** 和 **Phase 2** 之間，插入一個明確步驟：

```markdown
## Phase 1.5 -- 讀取並對齊 testplan 案例（如有 TP 引用）

1. READ 若本輪由 `/implement` 以 `testplan:TP-xxx` 呼叫，讀取 testplan.md 中
   該 TP 案例的完整列：需求追溯、測試層級、Public seam、優先級、
   Arrange（fixture）、Act（操作）、Assert（精確預期與驗證層）。
2. THINK 比對 Phase 1 收斂的 seam/slice 與 testplan 案例：
   - seam 是否一致？
   - Act 動作是否一致？
   - Assert 的驗證深度標記是否被涵蓋？
   若有差異，先回報並停止，不進入 RED。
3. WRITE 回報本輪的「測試意圖摘要」：
   - TP 案例 ID 與需求追溯
   - 測試將驗證的具體斷言（逐項列出，對齊 testplan Assert）
   - 使用的 fixture 與差異
```

### 為什麼這樣改

- 現狀的 `/tdd` 是通用的 TDD 引擎——它知道怎麼做 RED/GREEN/REFACTOR，但不知道 testplan 說了什麼。加入這個閘門讓它**先讀計畫、再寫測試**。
- 這是「測試計畫先把需求轉成具體的操作與預期結果，讓 AI 少一點自行猜測」的核心兌現點。如果 tdd 不讀 testplan，整個計畫就只是文件擺設。

### 預期效果

- RED 寫出的測試與 testplan 的 Assert 對齊，不會出現「紅燈原因正確但測的不是計畫要測的東西」。
- 發現 testplan 與實際 seam 不一致時能提早停止，而不是寫完才發現方向錯誤。

---

<a id="改進-c"></a>
## 改進 C：/tdd GREEN 階段加入「Assert 符合度回報」

### 要解決的問題

> 「測試通過，真的代表你想要的功能做到了嗎？」（圖中反思問題）

目前 GREEN 通過後，`/tdd` 只回報「綠燈狀態與後續可交給 REFACTOR 的整理範圍」。沒有任何步驟是比對「testplan 的 Assert 預期了 N 項，我的測試實際驗證了幾項」。

### 建議調整

在 `/tdd` SKILL.md 的 **Phase 3 步驟 4-5 之間**，加入一個比對步驟：

```markdown
5.5 THINK 若有 testplan:TP-xxx 引用，逐項比對 testplan Assert 與實際測試斷言：
    - 列出 testplan 預期的每個驗證點
    - 標記 ✅ 已有斷言覆蓋 / ⚠️ 部分覆蓋 / ❌ 未覆蓋
    - 若有 ❌，回報為「Assert 缺口」；由使用者決定是否需要補充或
      更新 testplan
```

在 Phase 3 的最後回報中，GREEN 的停止回報格式改為：

```markdown
6. WRITE 若 requested step 為 `GREEN`，回報：
   - 綠燈狀態
   - Assert 符合度表（testplan 預期 vs 實際斷言）
   - 若有 Assert 缺口，列為待決定事項
   - 後續可交給 REFACTOR 的整理範圍
```

### 為什麼這樣改

- 測試通過 ≠ 功能正確。如果 testplan 說「回應包含 fixture 中兩個分類及其識別／名稱」，但測試只斷言了 status 200 和 array length，那就是通過了但沒有真正驗證。
- 這個比對讓人類審閱者可以快速看出：這個 TP case 的測試到底覆蓋了多少計畫中的預期。

### 預期效果

- 每個 GREEN 完成後有具體的「測試 vs 計畫」對照表，人可以一眼看出缺口。
- 避免「所有測試都綠，上線後才發現某個重要的驗證根本沒測到」。

---

<a id="改進-d"></a>
## 改進 D：testplan 增加「執行狀態追蹤」區段與回寫 SOP

### 要解決的問題

> 「換一個新對話，只讓 Workflow 產出的文件，AI 還能寫出符合你原本測試意圖的測試，並繼續完成 TDD 嗎？」（圖中反思問題）

001 的 testplan 自行加了第 10 節追蹤執行結果，但 template 和 SKILL SOP 都沒有定義這個機制。其他迭代的 testplan 沒有這個區段。

### 建議調整

**1. Template 增加第 10 節**：

```markdown
## 10. 執行狀態追蹤

| TP ID | 狀態 | 執行日期 | 紅燈驗證 | 綠燈驗證 | Assert 符合度 | 備註 |
|---|---|---|---|---|---|---|
| TP-001 | ⬜ 未執行 | — | — | — | — | — |

狀態：⬜ 未執行 / 🔴 RED 通過 / 🟢 GREEN 通過 / ✅ 已驗收 / ❌ 失敗待修
```

**2. /tdd SOP 加入回寫步驟**：

```markdown
## Phase 5 -- 收尾與下一步

1.5 WRITE 若有 testplan:TP-xxx 引用，更新 testplan.md 第 10 節中該 TP 的狀態：
    - RED 完成後更新為 🔴，記錄紅燈原因
    - GREEN 完成後更新為 🟢，記錄 Assert 符合度
    - 若使用者確認驗收，更新為 ✅
```

**3. /testplan SOP Phase 3 對應調整**：

在 WRITE 步驟中加入：「初始化第 10 節，所有 TP 狀態為 ⬜ 未執行。」

### 為什麼這樣改

- 把執行結果持久化到 testplan，讓 testplan 從「計畫文件」變成「計畫 + 狀態追蹤文件」。
- 新 session 只要讀 testplan 第 10 節就知道目前進度，不需要重新翻閱所有對話。

### 預期效果

- 新 session 啟動時可以快速定位：哪些 TP 已完成、哪些正在 RED、哪些還沒開始。
- 作為 `/analyze` 新的檢查維度：testplan 狀態與 tasks 勾選是否一致。

---

<a id="改進-e"></a>
## 改進 E：/tdd 補充 testplan 必讀指令，消除交接斷層

### 要解決的問題

目前 `/tdd` SKILL.md 完全沒有提到 `testplan.md`。它是一個通用的 TDD 引擎，設計上由 `/implement` 傳入上下文。但這意味著如果 `/implement` 傳的資訊不完整，`/tdd` 不會主動去查。

### 建議調整

在 `/tdd` SKILL.md 的 **Phase 1 步驟 1** 中，加入：

```markdown
1. READ 讀取使用者需求、相關 artifact、既有測試、目標程式碼與專案上下文，
   確認本輪要處理的單一行為、可執行的測試命令與可觀測結果。
   **若呼叫者提供 `testplan:TP-xxx` 引用，必須 READ testplan.md 中該案例
   的完整列（需求追溯、測試層級、seam、Arrange、Act、Assert 與驗證層），
   作為本輪的需求權威；不得以呼叫者的摘要取代原始案例。**
```

同時在 `/implement` SKILL.md 的 Phase 4 步驟 3 中，補充傳遞格式：

```markdown
   - 向 `/tdd` 傳入：T 編號、requested step、testplan:TP-xxx 案例 ID、
     **testplan.md 路徑**、public seam、任務描述與完成條件。
```

### 為什麼這樣改

- 讓 `/tdd` 從「被動接收」變成「主動驗證」。即使 `/implement` 的摘要遺漏了某個 Assert，`/tdd` 自己去讀 testplan 就能發現。
- 降低 `/implement` → `/tdd` 交接的資訊損耗風險。

### 預期效果

- `/tdd` 在任何情境下（獨立呼叫或 `/implement` 派送）都能找到 testplan 的測試意圖。
- 消除「AI 基於不完整資訊寫測試」的風險。

---

<a id="改進-f"></a>
## 改進 F：testplan 增加「AI 自主決策紀錄」區段

### 要解決的問題

> 「這次成功，有哪些是 AI 自己想到的？例如修改功能時，AI 恰好記得先調整測試計畫。這件事在你的 Workflow 中有被交代清楚嗎？」（圖中反思問題）

AI 在 TDD 過程中經常會做出 testplan 沒有預期到的決定：
- 發現一個 testplan 沒列的邊界情境
- 選擇了一個不同的 fixture 策略
- 因為實作限制調整了 Assert 的具體值

這些決定散落在對話歷史中，換 session 就丟失。

### 建議調整

在 testplan template 增加一個區段（或在既有「待確認事項」後方）：

```markdown
## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | （初始為空；由 /tdd 執行過程中回寫） | — |

記錄規則：
- AI 在 TDD 過程中發現 testplan 未預期的情境、做出與計畫不同的設計選擇、
  或調整了 Assert 的具體驗證方式時，必須回寫此表。
- 「處置」欄可為：已更新案例 / 已新增待確認 / 已回報使用者待決定。
- 此表不取代 testplan 的正式案例；重大發現應升級為新的 TP 案例或待確認事項。
```

同時在 `/tdd` SOP 的 Phase 2（RED）和 Phase 3（GREEN）加入：

```markdown
WRITE 若本輪做了 testplan 未預期的決策（新邊界情境、fixture 差異、
Assert 調整），回寫 testplan.md 第 11 節；重大發現另行回報使用者。
```

### 為什麼這樣改

- 讓 AI 的「靈感」持久化，而不是只活在一次對話中。
- 下次遇到類似情境時，AI 可以參考之前的決策紀錄，而不是重新猜。
- 人類審閱者可以看到 AI 在哪些地方「自作主張」，判斷是否值得寫進 Skill。

### 預期效果

- 建立一個「AI 經驗資料庫」，隨著迭代累積。
- 為 Skill 改進提供證據：哪些 AI 決策反覆出現，就值得寫進規則。

---

<a id="改進-g"></a>
## 改進 G：新 session 啟動摘要機制

### 要解決的問題

> 「換一個新對話，還能做到嗎？不依賴前一段對話。」（圖中反思問題）

目前 testplan 的「新 session 啟動檢查」是一個核對清單（檢查 spec、plan、seam 等），但沒有提供一個「快速狀態摘要」讓 AI 能在最少 READ 次數下恢復上下文。

### 建議調整

在 testplan template 的「新 session 啟動檢查」增加一個摘要區：

```markdown
### 快速狀態摘要（由最近一次 TDD 執行後更新）

- **最後執行日期**：—
- **已完成 TP**：（列出已 🟢/✅ 的 TP ID）
- **進行中 TP**：（列出 🔴 的 TP ID 及紅燈原因）
- **未啟動 TP**：（列出 ⬜ 的 TP ID）
- **已知阻塞**：（列出影響後續的待確認/缺口）
- **下一步建議**：（建議從哪個 TP 的哪個 TDD 步驟繼續）
```

這個摘要由 `/tdd` Phase 5 或 `/implement` Phase 5 在每次完成一個 TP 後自動更新。

### 為什麼這樣改

- 新 session 的 AI 讀一個段落就能知道：做到哪了、接下來做什麼。
- 避免因為 READ 不足而重複已完成的工作，或跳過未完成的工作。

### 預期效果

- 新 session 冷啟動時間從「讀 5+ 份文件」降低到「讀 testplan 的摘要段落 + 按需讀取」。
- 降低新 session 誤判進度的風險。

---

<a id="改進-h"></a>
## 改進 H：/tasks 的 RED 任務描述加入可驗證完成條件

### 要解決的問題

目前 tasks.md 的 RED 任務描述像是：

> `T003 [TDD:RED] 在 menu-api.test.js 驗證 TP-001 分類列表欄位與資料`

這告訴 AI「去寫這個測試」，但沒有告訴它「怎麼判斷這個 RED 寫得正確」。RED 的完成條件應該是「測試因為正確的行為缺口而失敗」，但目前需要 AI 自行從 testplan 推導。

### 建議調整

修改 `/tasks` SKILL.md Phase 3 步驟 3 的任務描述格式：

```markdown
- [ ] T003 [US1] [TDD:RED] 為 TP-001 建立分類列表欄位的測試
  完成條件：測試因「listCategories 尚未回傳完整分類欄位」而失敗
  ← `testplan:TP-001`; `spec:US1`; `openapi:listCategories`
```

即每個 `[TDD:RED]` 任務多一行「完成條件」，明確寫出**預期的紅燈原因**。

### 為什麼這樣改

- 把 testplan 的 Assert 轉化為 RED 的可驗證完成條件，讓 `/tdd` 執行時有明確的「紅燈應該長什麼樣」。
- 避免 AI 寫出一個因為語法錯誤或環境問題而紅的測試，卻誤以為是正確的紅燈。

### 預期效果

- `/tdd` 可以比對：實際的紅燈原因 vs 任務指定的完成條件，明確判斷是否是「正確的紅燈」。
- 降低「紅燈原因錯誤但 AI 沒發現」的風險。

---

<a id="改進-i"></a>
## 改進 I：精簡或刪除重複的防護性文字

### 要解決的問題

> 「你提出的改進，真的有助於測試驅動開發或提高可靠度嗎？還是只是多增加文件？有時候，刪掉重複或沒有幫助的內容，也是一種改進。」（圖中反思問題）

目前的 Skill 文件中有大量重複的防護性文字，例如：

- `/testplan` SKILL.md：「不得自行推導或重新設計」出現了多次變體
- `/testplan` template 每個章節都重複「不得自行補造」
- `/tdd` rules 中「垂直切片」、「好測試壞測試」、「Seam 與公共介面」的 Good/Bad Example 風格相同但主旨有重疊

這些重複文字佔用了 AI 的 context window，降低了每次 READ 的訊號密度。

### 建議調整

1. **在 testplan SKILL.md 中**：將重複出現的「不得自行推導/補造」條款集中到一個「通用約束」段落，各 Phase 引用而非重述。

2. **在 testplan template 中**：將 HTML 註解（`<!-- -->`）中的重複指導刪減為一行引用，例如：
   ```markdown
   <!-- 案例格式詳見 SKILL.md §通用約束。 -->
   ```

3. **在 /tdd rules 中**：考慮將六份 rules 合併為三份：
   - `rules/判準-測試品質.md`：合併「好測試壞測試」+「3A 格式」+「Mock 邊界」
   - `rules/判準-執行流程.md`：合併「垂直切片」+「適用時機」
   - `rules/判準-介面邊界.md`：保留「Seam 與公共介面」（此份較獨立）

### 為什麼這樣改

- 每減少一行重複文字，就多出一行給 AI 理解真正重要的指令。
- 目前 testplan SKILL.md 約 50 行，但扣除重複防護條款後的**新資訊**大約只有 30 行——幾乎 40% 是重複的語義。
- rules 文件從六份降為三份，AI 在按需讀取時的 READ 次數減少。

### 預期效果

- AI 在有限的 context window 中能接收到更高訊號密度的指令。
- 維護成本降低：修改一條規則只需要改一個地方。

---

<a id="總結"></a>
## 總結：改進優先級與預期效果

| 優先級 | 改進 | 要解決的問題 | 改動範圍 | 預期效果 |
|---|---|---|---|---|
| **P0** | **B. /tdd RED 對齊閘門** | AI 寫的測試偏離 testplan 意圖 | `/tdd` SKILL.md 加 Phase 1.5 | 測試意圖與計畫一致 |
| **P0** | **E. /tdd 必讀 testplan** | 交接資訊損耗 | `/tdd` SKILL.md Phase 1；`/implement` Phase 4 | 消除 testplan→tdd 斷層 |
| **P1** | **A. Assert 驗證深度標記** | 測試只查回應不查狀態 | testplan template 加欄/前綴 | 驗證深度明確，跨 session 一致 |
| **P1** | **C. GREEN Assert 符合度** | 綠燈≠功能正確 | `/tdd` Phase 3 加步驟 | 每次 GREEN 有比對報告 |
| **P1** | **H. RED 完成條件** | 紅燈可能錯誤方向 | `/tasks` 任務描述格式 | 紅燈原因可驗證 |
| **P2** | **D. 執行狀態追蹤** | 新 session 不知進度 | testplan template 加第 10 節 | 進度可追蹤、可恢復 |
| **P2** | **G. 新 session 摘要** | 恢復上下文成本高 | testplan 新 session 區段 | 冷啟動更快 |
| **P2** | **F. AI 決策紀錄** | 經驗不持久化 | testplan 加第 11 節 | 累積可復用的決策 |
| **P3** | **I. 精簡重複文字** | context window 浪費 | 跨多份 Skill 文件 | 訊號密度提高 |

### 建議的實施順序

```
第一批（最高影響）：B + E → 讓 /tdd 先能讀到 testplan
第二批（提高品質）：A + C + H → 讓測試意圖精確、可驗證
第三批（跨 session）：D + G + F → 讓進度可追蹤、經驗可累積
第四批（維護優化）：I → 降低文件維護成本與 AI 負擔
```

### 附註：不建議做的事

- **不建議讓 testplan 直接寫測試程式碼**：testplan 是計畫，不是程式。寫程式是 `/tdd` 的責任。
- **不建議自動跳過 RED 直接 GREEN**：即使測試看起來「很簡單」，紅燈驗證是 TDD 可靠度的基礎。
- **不建議在 testplan 中加入 runtime 覆蓋率指標**：覆蓋率是實作產物，不是計畫產物；但可以在 `/analyze` 中增加覆蓋率檢查。
