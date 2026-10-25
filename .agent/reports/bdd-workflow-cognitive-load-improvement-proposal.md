# AI × BDD Workflow 認知負擔改進建議

> 目標：讓人只需要用白話文的業務情境，就能推理出「剛剛好」的自動化測試；  
> 減少閱讀程式碼、追溯表格、DSL 細節的認知負擔。

---

## 一、核心問題診斷

### 1.1 從實際產物觀察到的認知負擔

| 痛點 | 現況描述 | 影響 |
|------|---------|------|
| **Traceability 表格過於龐大** | `acceptance-to-interface-traceability.md` 單一 plan（如 005）就有 30+ 列寬表格，每列 11 欄，需左右捲動才能讀完 | 人無法一眼掃過「這個情境對不對？還缺什麼？」 |
| **DSL 欄位重複且冗長** | 後端購物車 DSL 有 20+ 個 Then 句型，許多語意極度相似（如「總額依目前可用項目更新」vs「總額依剩餘可用項目更新」vs「回傳總額等於所有可用項目依目前價格計算後的總和」） | 增加了 AI 與人的比對負擔，不是「剛剛好」 |
| **Acceptance Feature 與 Interface Feature 的鴻溝** | `/spec-by-example` 產出 PM 可讀的 Journey，`/dsl-refine` 衍生原子化介面 Feature，但兩者之間的轉譯邏輯全在 AI 腦中，人無法直觀驗證「這段 Journey 是否被正確拆開了」 | 人被迫讀大量介面 Feature 才能確認覆蓋 |
| **SOP 步驟過多且交叉引用** | `/dsl-refine` 有 5 個 Phase、每個 Phase 3–5 步，還要交叉讀取 STANDARDS.md、多份 rules、多份 templates | AI 容易在長 SOP 中遺漏步驟或產出格式不一致 |
| **業務情境讀一次不能懂** | 要理解「停供餐點後購物車行為」這個情境，需要讀 acceptance Feature → traceability → frontend Feature → backend Feature → 兩份 DSL，跨 5 個以上檔案 | 人必須另外翻文件才看得懂 |

### 1.2 問題根源：翻譯層太多、中間產物太重

```
spec.md → acceptance .feature → traceability.md → interface .feature → dsl.md → tasks.md → bdd red/green
   ①          ②                     ③                  ④              ⑤         ⑥          ⑦
```

人需要「讀懂」的層數太多。理想上，人只需要確認 ②（業務情境對不對）和 ④⑤（介面測試合不合理），中間的 ③ 覆蓋矩陣應該是 AI 自動驗證的，不需要人逐行核對。

---

## 二、`/spec-by-example` 改進建議

### 2.1 引入「情境地圖」摘要（新增產物）

**問題**：目前 acceptance Feature 是一份 Gherkin 檔案，適合 PM DEMO，但不適合快速掌握「這個 spec 有哪些情境、哪些變體、哪些邊界」。

**建議**：Phase 2 完成後，在 `.feature` 檔頭部或同目錄產出一份 `情境地圖.md`，用樹狀結構呈現：

```markdown
## 情境地圖：顧客付款與取消訂單

### 核心旅程
- ✅ 顧客完成付款 → 查看付款狀態
- ✅ 付款失敗 → 重試成功

### 關鍵變體
- ✅ 已付款不重複扣款
- ✅ 顧客端金額不覆寫應付金額
- ✅ 付款冪等（重送已成功付款）

### 取消流程
- ✅ 未接單未付款 → 取消
- ✅ 已付款未接單 → 取消 + 退款
- ✅ 已接單 → 拒絕取消
- ✅ 付款處理中 → 拒絕（非 stale）/ 允許（stale）

### 店家視角
- ✅ 依付款狀態篩選
- ✅ 已取消訂單不可接單/出餐

### 待澄清
- ❓ （列出 need clarification 標籤）
```

**效果**：人讀這張地圖 30 秒就能判斷「有沒有漏掉的情境」，不用逐行讀 Gherkin。

### 2.2 減少 `[need clarification]` 的最低數量門檻

**問題**：Rule 3 要求「至少 3 個」待澄清標籤。這導致 AI 為了湊數而提出低價值問題，增加 clarify 來回次數。

**建議**：改為「至少 1 個、最多 10 個」，並加入品質判準：

```markdown
# 修改後 Rule 3
- 每次產出的 Feature 必須包含 1 至 10 個待澄清標籤。
- 只有滿足以下至少一個條件的問題才值得標記：
  a) 答案會改變至少一個驗收結果的預期（Given/When/Then）
  b) 答案會新增或移除一個完整的 Rule 或 Example
  c) spec 中存在相互矛盾的陳述
- 若 spec 已足夠明確且無值得標記的問題，可以 0 個標籤產出，
  但須在交付摘要中說明「本輪無需澄清」的判斷依據。
```

### 2.3 Journey Example 加入「驗收結果摘要註解」

**問題**：Journey 型 Example 的 Then 步驟是業務語言，但讀者不容易一眼看出「這個案例到底驗了什麼」。

**建議**：在每個 Example 的最後加入一行結果摘要註解：

```gherkin
Example: 顧客取消已付款但未接單的訂單後看到退款
  Given 顧客有一筆已付款、尚未接單的訂單
  When 顧客取消該訂單
  Then 訂單標示為已取消，付款標示為已退款，訂單明細仍保留
  # 驗收結果：取消成功 + 同步退款 + 快照不變
```

---

## 三、`/dsl-refine` 改進建議

### 3.1 用「介面情境摘要」取代寬表格 Traceability

**問題**：11 欄的 Coverage Matrix 是給 AI 機械核對用的，不是給人讀的。人被迫讀一張 30 列的寬表，才能確認覆蓋是否正確。

**建議**：將 `traceability.md` 拆成兩層：

#### 層 1：人讀的「介面情境摘要」（新格式）

```markdown
## 前端 / 顧客訂單

| 驗收情境 | 前端驗什麼 | 來源 |
|---------|-----------|------|
| 顧客成功付款 | 顯示已付款狀態，出餐狀態不變 | AC: 顧客完成付款 |
| 金額篡改無效 | 畫面金額維持 server snapshot | AC: 顧客端提交不同金額 |
| 不重複扣款 | 顯示已付款/處理中結果 | AC: 已付款或處理中 |
| 付款失敗重試 | 可重試並顯示成功 | AC: 付款失敗後重試 |

## 後端 / 訂單

| 驗收情境 | 後端驗什麼 | 來源 |
|---------|-----------|------|
| 顧客成功付款 | 保存 paid + 快照金額 | AC: 顧客完成付款 |
| 金額篡改無效 | 權威計價不採信 request amount | AC: 顧客端提交不同金額 |
| ...
```

#### 層 2：AI 讀的機械覆蓋矩陣（保留但不要求人 Review）

原有的 11 欄表格降級為 AI 內部覆蓋稽核工具的輸入，不在交付報告中要求使用者逐行閱讀。

**效果**：人只需 Review 「介面情境摘要」，確認每個介面「測的是什麼」；覆蓋完整性由 AI 機械稽核保證。

### 3.2 DSL 句型去重與分層精簡

**問題**：購物車 DSL 有大量語意重疊的 Then 句型。例如：

- `回傳總額等於所有可用項目依目前價格計算後的總和`
- `購物車總額依目前可用項目更新`
- `購物車總額依剩餘可用項目更新`
- `總金額依剩餘可用項目重新計算`

四句話本質上驗的是同一件事：「總額 = 可用項目的目前價格合計」。

**建議**：在 STANDARDS.md 或 `/dsl-refine` Rules 加入「句型去重判準」：

```markdown
# 新增 Rule：Then 句型去重

- 若兩個 Then 句型的「驗證契約」（必查的權威狀態 + 呈現結果）完全相同，
  必須合併為一個句型，用 Gherkin 參數區分變體。
- 合併候選判定方式：
  a) 兩者的 DSL 實作語意欄中「必查」項目相同
  b) 兩者差異僅在中文用詞的微調（如「更新」vs「重新計算」）
- 若合併後句型仍然過長或不自然，可保留兩個但須在 DSL 中
  交叉引用，明確說明差異點。
```

### 3.3 衍生 Feature 加入「這個 Feature 驗什麼」一句話摘要

**問題**：介面 Feature 的 Feature 標題通常是功能名稱（如「付款與取消」），但讀者需要讀完所有 Rule 和 Example 才知道它在驗什麼面向。

**建議**：在每個衍生 Feature 的 Feature 描述中加入一句話摘要：

```gherkin
Feature: 顧客訂單付款與取消

  本 Feature 驗證：顧客付款使用訂單快照金額、不重複扣款、
  失敗可重試、取消依出餐狀態限制，以及付款與取消狀態的正交性。

  Rule: 付款金額以訂單快照為準並保存正交付款狀態
    ...
```

### 3.4 Phase 精簡：合併覆蓋對照與衍生 Feature

**問題**：Phase 2（建立覆蓋對照）和 Phase 3（衍生介面 Feature）在認知上是同一件事——「把 acceptance 拆到介面」。分成兩個 Phase 導致 AI 執行時容易斷裂（先建完整覆蓋表，再回頭寫 Feature）。

**建議**：合併為 Phase 2「衍生介面 Feature 並同步建立追溯」：

```markdown
## Phase 2 -- 衍生介面 Feature 並建立追溯

1. THINK 逐個 acceptance Example，判斷其涉及的介面與驗證面向。
2. WRITE 為每個面向建立原子化 Feature，同時在追溯摘要中記錄來源。
3. THINK 檢查每個 spec requirement ID 是否都有承接，漏掉的標記 unmapped。
```

原 Phase 4（收斂 DSL）和 Phase 5（驗收可落地性）保留。

---

## 四、整體 Workflow 改進建議

### 4.1 建立「業務情境索引」——人只需 Review 一個地方

**問題**：目前的真相分散在 acceptance Feature、traceability、interface Feature、DSL 四個產物中。人要確認「這個業務規則的測試對不對」，需要跨 4+ 個檔案。

**建議**：在 `/dsl-refine` 完成後，自動產出一份「業務情境索引」（放在 `PLAN_DIR/scenario-index.md`），格式如下：

```markdown
# 業務情境索引：005 付款與取消

## 情境 1：顧客成功付款

**業務規則**：付款金額以訂單建立時快照為準，不接受顧客端金額

| 誰驗 | 驗什麼 | Feature 位置 |
|------|--------|-------------|
| 後端 | 保存 paid 狀態 + 快照金額 | `backend/訂單/付款與取消.feature#付款成功後保存paid` |
| 後端 | request amount 不覆寫快照 | `backend/訂單/付款與取消.feature#付款請求金額不覆寫` |
| 前端 | 顯示已付款狀態 | `frontend/顧客訂單/付款與取消.feature#成功付款後看到已付款` |
| 前端 | 錯誤金額仍顯示 server 價格 | `frontend/顧客訂單/付款與取消.feature#嘗試錯誤金額` |

**缺口**：無

---

## 情境 2：不重複扣款

**業務規則**：已付款或付款處理中的訂單，第二次付款請求不啟動新扣款

| 誰驗 | 驗什麼 | Feature 位置 |
|------|--------|-------------|
| 後端 | 不建立第二個 payment attempt | `backend/訂單/付款與取消.feature#已付款拒絕再次扣款` |
| 前端 | 顯示已付款/處理中結果 | `frontend/顧客訂單/付款與取消.feature#不會重複扣款` |

**缺口**：無
```

**效果**：

1. 人 Review 時只需讀這一份文件
2. 用「情境」為單位組織，而不是用「檔案」為單位
3. 每個情境一目了然：業務規則是什麼、前後端各驗什麼、有沒有缺口
4. AI 仍然用原有的 traceability 做機械稽核，人不需要讀那張大表

### 4.2 給 `/clarify` 加入「不問就不問」的判準

**問題**：`/spec-by-example` 強制要求至少 3 個 clarify 問題，`/clarify` 本身的 session 最多 5 題。這個下限導致 spec 已經夠明確時仍然被迫提問。

**建議**：在 `/clarify` 加入「豁免判準」：

```markdown
## 豁免判準

若以下三個條件同時成立，呼叫者可跳過 /clarify：
1. spec 中無標記為「假設」的未確認事項
2. acceptance Feature 中無矛盾或多義的 Then
3. 所有 Rule 的驗收結果都可從 spec 明確推導

跳過時須在交付摘要中列出判斷依據。
```

### 4.3 DSL 分「人讀」與「AI 讀」兩層

**問題**：DSL 目前是一張包含所有技術細節的表格。人需要看的其實只有「這個句子是什麼意思」和「參數是什麼」，不需要看到 Playwright/HTTP 實作語意。

**建議**：

#### 層 1：業務 DSL（人讀）

```markdown
| 句型 | 參數 | 意思 |
|------|------|------|
| `顧客成功付款後看到已付款狀態` | 無 | 付款結果頁顯示「已付款」且出餐狀態不變 |
| `顧客嘗試以錯誤金額付款仍依訂單快照計價` | 無 | 畫面金額維持 server 快照，不被 client 覆寫 |
```

#### 層 2：技術 DSL（AI 讀，落地 step definition 用）

保持現有 DSL 格式不變，但標註為「測試落地參考」，人不需要 Review。

### 4.4 減少 STANDARDS.md 與 Rules 的交叉引用

**問題**：`/dsl-refine` 的 SOP 中，Phase 1 就要求讀取 5 個以上的外部檔案（STANDARDS.md、rules/介面功能模組...、rules/驗收案例原子化...、plan-truth-workflow.md、Rule-Truth-Owner...）。AI 在長對話中容易遺漏。

**建議**：

1. **將 Rules 內嵌到 SKILL.md**：每個 Rule 的核心判準（1-2 句話）直接寫在 SOP 步驟旁邊，詳細 Good/Bad Example 放在 Rules 檔案中供按需參考。
2. **減少 READ 指令數量**：在 Phase 1 統一讀取所有必要檔案，後續 Phase 不再重複 READ，只在需要細部判準時才按需讀取。

```markdown
# 改進前（Phase 3 step 3）
3. READ 讀取 `templates/interface-feature.feature` 與 `templates/interface-feature.example.feature`

# 改進後
3. WRITE 依 Phase 1 已載入的骨架建立 Feature
   # 判準提醒：一個 Rule = 一個可獨立判定的驗證面向；一個 Example = 一個 When
```

### 4.5 `/tasks` 加入「業務情境到任務」的快速對照

**問題**：`tasks.md` 以 Feature 檔為 Phase 單位，但人想知道的是「這個業務情境的 RED/GREEN 做到哪了」。

**建議**：在 `tasks.md` 頭部加入「情境進度表」：

```markdown
## 情境進度

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
|---------|---------|-----------|---------|-----------|------|
| 顧客成功付款 | ⬜ T012 | ⬜ T013 | ⬜ T020 | ⬜ T021 | |
| 不重複扣款 | ⬜ T014 | ⬜ T015 | ⬜ T022 | ⬜ T023 | |
| 付款失敗重試 | ⬜ T016 | ⬜ T017 | ⬜ T024 | ⬜ T025 | |
| 取消未接單訂單 | ⬜ T018 | ⬜ T019 | ⬜ T026 | ⬜ T027 | |
```

### 4.6 Workflow 步驟精簡——讓「可以跳過」的步驟更明確

**問題**：主流程有 8 個步驟，但不是每個 spec 都需要完整走完。例如小型 bug fix 不需要 system-analysis，純後端功能不需要 ui-plan。

**建議**：在 `sdd-primary-workflow.md` 加入「精簡路徑」：

```markdown
## 精簡路徑

### 純後端 API 功能
/specify → /spec-by-example → /technical-research → /api-plan → /dsl-refine → /tasks → /implement

### 小型 bug fix（已有 spec 和 Feature）
/dsl-refine（更新受影響 Feature）→ /tasks（新增修復任務）→ /implement

### 純前端 UI 調整
/specify → /spec-by-example → /ui-plan → /dsl-refine → /tasks → /implement
```

---

## 五、改進優先級

| 優先級 | 改進項目 | 技能 | 預期效果 |
|--------|---------|------|---------|
| **P0** | 情境地圖摘要 | `/spec-by-example` | 人 30 秒掌握全貌 |
| **P0** | 介面情境摘要取代寬表格 | `/dsl-refine` | Review 時間減少 70% |
| **P0** | 業務情境索引 | `/dsl-refine` 收尾 | 人只需 Review 一份文件 |
| **P1** | DSL 句型去重判準 | `/gherkin-and-dsl` | 句型量減少 30%+ |
| **P1** | 放寬 clarify 最低門檻 | `/spec-by-example` | 減少無意義提問 |
| **P1** | Rules 核心判準內嵌 SOP | 各 Skill | AI 執行一致性提升 |
| **P2** | DSL 分人讀/AI讀兩層 | `/gherkin-and-dsl` | 非技術人員可參與 Review |
| **P2** | 情境進度表 | `/tasks` | 進度追蹤更直覺 |
| **P2** | 精簡路徑 | `sdd-primary-workflow` | 小需求不走完整流程 |
| **P2** | Feature 一句話摘要 | `/dsl-refine` | 快速理解 Feature 用途 |

---

## 六、總結：核心設計原則

> **人只需要確認「情境對不對」，不需要確認「覆蓋完不完整」。**

覆蓋完整性是 AI 用機械稽核保證的，人的注意力應該放在：

1. **有沒有漏掉的業務情境？**（看情境地圖）
2. **每個情境的前後端各驗了什麼？合不合理？**（看介面情境摘要或業務情境索引）
3. **想增加邊界條件或例外情境時，能不能直接用白話文描述？**（`/clarify` 或直接加 acceptance Example）

中間的 traceability、DSL 技術欄位、覆蓋矩陣稽核——這些是 AI 的工作，不是人的工作。

---

*建立日期：2026-10-26*  
*適用 Workflow 版本：sdd-primary-workflow v1.2*
