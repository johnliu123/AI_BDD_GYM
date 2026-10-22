---
name: tdd
description: 當使用者要以測試先行方式實作 feature、修 bug、變更行為，或明確提到 red-green-refactor 時，使用此 skill。此 skill 也支援被 `implement` 以單一步驟模式呼叫，例如只執行 `RED`、`GREEN` 或 `REFACTOR`。
---

# Test-Driven Development

這份 skill 把 TDD 收斂成最小可執行控制平面：先對齊 seam 與單一切片，再依請求執行 `RED`、`GREEN`、`REFACTOR` 單一步驟，或在未指定步驟時執行完整 `RED -> GREEN -> REFACTOR`。細部判準按需讀取對應 `rules/`。

# SOP

## Phase 1 -- 對齊需求、requested step 與本輪 seam

1. READ 讀取使用者需求、相關 artifact、既有測試、目標程式碼與專案上下文，確認本輪要處理的單一行為、可執行的測試命令與可觀測結果。**若呼叫者提供 `testplan:TP-xxx` 引用，必須 READ `testplan.md` 中該案例的完整列（需求追溯、測試層級、seam、Arrange、Act、Assert 與驗證層標記），作為本輪的需求權威；不得以呼叫者的摘要取代原始案例。**
2. READ 若需要判斷本次是否適合用 TDD，讀取 `rules/判準-執行流程.md`。
3. READ 若需要確認 public seam、觀測邊界與不該直接碰觸的 internals，讀取 `rules/判準-介面邊界.md`。
4. THINK 依本次已載入規則收斂本輪只做一個 vertical slice：選定單一 public seam、requested step（`RED` / `GREEN` / `REFACTOR` / `FULL`）、預期紅燈原因、通過條件、必要 mock 邊界與明確 out-of-scope。
5. WRITE 向使用者回報本輪 `public seam`、單一測試目標、requested step、預期紅燈原因與 out-of-scope；若 seam 尚未對齊，先停下確認，不進入後續步驟。

## Phase 1.5 -- 讀取並對齊 testplan 案例（如有 TP 引用）

> 此 Phase 確保 `/tdd` 寫的測試與 testplan 的測試意圖一致，避免「紅燈原因正確但測的不是計畫要測的東西」。

1. READ 若本輪由 `/implement` 以 `testplan:TP-xxx` 呼叫，讀取 `testplan.md` 中該 TP 案例的完整列：需求追溯、測試層級、Public seam、優先級、Arrange（fixture）、Act（操作）、Assert（精確預期與驗證層標記）。
2. THINK 比對 Phase 1 收斂的 seam／slice 與 testplan 案例：
   - seam 是否一致？
   - Act 動作是否一致？
   - Assert 的驗證層標記（`[response]`、`[response+state]`、`[response+side-effect]`、`[state-only]`、`[idempotent]`）是否被涵蓋？
   若有差異，先回報並停止，不進入 RED。
3. WRITE 回報本輪的「測試意圖摘要」：
   - TP 案例 ID 與需求追溯
   - 測試將驗證的具體斷言（逐項列出，對齊 testplan Assert）
   - 使用的 fixture 與差異
4. THINK 若無 `testplan:TP-xxx` 引用（獨立呼叫），跳過本 Phase，沿用 Phase 1 的 seam 與 slice。

## Phase 2 -- RED：寫出正確失敗的測試

1. READ 讀取 `rules/判準-測試品質.md`（涵蓋好測試判準、3A 結構、mock 邊界）。
2. WRITE 若 requested step 為 `RED` 或 `FULL`，只為當前 slice 寫一個測試，直接落在真實測試檔與既有測試框架上；不得先寫 production code，也不得一次鋪多個情境。
3. READ 若 requested step 為 `RED` 或 `FULL`，執行最小必要測試命令，確認新測試確實失敗，且失敗原因對準尚未實作的行為缺口，而不是測試寫錯、環境壞掉或斷在其他地方。**若有 testplan:TP-xxx 引用，額外確認紅燈的 assertion 對準 testplan Assert 的每一項驗證點，而不只是「有失敗」。若呼叫者（如 `/implement`）另外提供該任務的「完成條件」，一併比對實際紅燈原因與完成條件是否一致；不一致時回報差異並停止，不自行判定何者為準。**
4. THINK 若 requested step 為 `RED` 或 `FULL`，且紅燈原因不正確、測試耦合 internals、或需要靠 side channel 才能驗證，先修正測試與 seam；不得跳去寫實作掩蓋問題。
5. WRITE 若本輪做了 testplan 未預期的決策（新邊界情境、fixture 差異、Assert 調整），回寫 `testplan.md` 第 11 節「AI 自主決策與發現紀錄」；重大發現另行回報使用者。
6. WRITE 若 requested step 為 `RED`，在紅燈原因正確後立即停止，回報目前紅燈狀態與後續應交給 `GREEN` 的缺口。

## Phase 3 -- GREEN：以最小實作通過紅燈

1. READ 讀取 `rules/判準-執行流程.md`，確認本輪只允許最小實作、不可預作未來行為，也不可把多個 slice 混在一起。
2. THINK 若 requested step 為 `GREEN` 或 `FULL`，先確認當前 slice 已有正確紅燈；若沒有，應回報前置不足並停止，不得默默補跑整輪。
3. WRITE 若 requested step 為 `GREEN` 或 `FULL`，只撰寫讓當前紅燈轉綠所需的最小 production code；不得偷塞下一個案例、額外抽象或未被測試要求的功能。
4. READ 若 requested step 為 `GREEN` 或 `FULL`，重新執行當前測試，必要時再跑受影響的相關測試，確認目前 slice 已轉綠且沒有把其他既有行為打壞。
5. THINK 若 requested step 為 `GREEN` 或 `FULL`，且實作包含 speculative branches、未被本輪測試要求的條件處理，或只是靠修改測試迴避真問題，先刪回最小可通過版本。
6. THINK 若有 `testplan:TP-xxx` 引用，逐項比對 testplan Assert 與實際測試斷言，產出 **Assert 符合度表**：
   - 列出 testplan 預期的每個驗證點
   - 標記 ✅ 已有斷言覆蓋 / ⚠️ 部分覆蓋 / ❌ 未覆蓋
   - 若有 ❌，回報為「Assert 缺口」；由使用者決定是否需要補充或更新 testplan。
7. WRITE 若本輪做了 testplan 未預期的決策（新邊界情境、fixture 差異、Assert 調整），回寫 `testplan.md` 第 11 節「AI 自主決策與發現紀錄」；重大發現另行回報使用者。
8. WRITE 若 requested step 為 `GREEN`，在綠燈成立後立即停止，回報：
   - 綠燈狀態
   - Assert 符合度表（testplan 預期 vs 實際斷言）
   - 若有 Assert 缺口，列為待決定事項
   - 後續可交給 `REFACTOR` 的整理範圍

## Phase 4 -- REFACTOR：綠燈下整理而不擴 scope

1. THINK 若 requested step 為 `REFACTOR` 或 `FULL`，先確認目前相關測試為綠燈；若沒有，應回報前置不足並停止，不得一邊補綠一邊重構。
2. WRITE 若 requested step 為 `REFACTOR` 或 `FULL`，只做 behavior-preserving cleanup，例如命名、重複消除或小幅抽取；若已牽涉新設計決策、跨多模組重構或新的需求切片，應停下並回報。
3. READ 若 requested step 為 `REFACTOR` 或 `FULL`，重新執行受影響測試，確認整理後仍維持綠燈。
4. WRITE 若 requested step 為 `REFACTOR`，在整理完成後停止，回報本輪整理內容、維持綠燈的驗證結果與下一個建議 slice。

## Phase 5 -- 收尾與下一步

1. WRITE 若 requested step 為 `FULL`，整理本輪完成的 seam、紅燈到綠燈的演進、重構結果、已通過的測試、剩餘風險與下一個建議 slice，回報給使用者作為後續是否續跑的依據。
2. WRITE 若有 `testplan:TP-xxx` 引用，更新 `testplan.md` 第 10 節「執行狀態追蹤」中該 TP 的狀態：
   - RED 完成後更新為 🔴，記錄紅燈原因。
   - GREEN 完成後更新為 🟢，記錄 Assert 符合度摘要。
   - 若使用者確認驗收，更新為 ✅。
3. WRITE 若有 `testplan:TP-xxx` 引用，更新 `testplan.md` 第 7 節「快速狀態摘要」中的已完成／進行中／未啟動 TP 清單與下一步建議。
