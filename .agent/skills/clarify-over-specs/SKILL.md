---
name: clarify-over-specs
description: 在 `/specify` 交付 spec.md 之後，依使用者明確要求對規格做專業覆蓋掃描與有限澄清；問答互動委派 `/clarify`；決策寫回 spec 並驗證。預設不自動執行。
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Clarify Over Specs

在功能規格已產出且通過結構驗證後，對 `spec.md` 做第二 pass 的需求澄清：先系統性掃描缺口，再透過 `/clarify` 訪談使用者，並將決策寫回規格。本 skill 不取代 `/specify` 寫 spec 前的高影響 `/clarify`。

# SOP

## Phase 0 -- 確認執行閘門

1. THINK 若使用者未明確要求執行本 skill（例如未 invoke `/clarify-over-specs`，且未在 specify 交付時明確表示要做 spec 全文健檢），不得開始掃描或修改 spec。
2. READ 確認目標 `spec.md` 路徑；若使用者未指定，依 `/specify` 慣例推斷 `specs/<feature-branch>/spec.md` 並請使用者確認。
3. DELEGATE 從 `/specify` skill 根目錄執行 `uv run scripts/validate_spec.py <spec-path>`；若尚未通過，先請使用者完成 `/specify` 或修正 spec，不得在本 skill 中從零撰寫規格。
4. THINK 若使用者明確表示跳過澄清（例如 exploratory spike），WARN 下游 rework 風險後結束，不修改 spec。

## Phase 1 -- 覆蓋掃描與候選題排序

1. READ 讀取目標 `spec.md`、`/specify` 的 `templates/spec.template.md`，以及 `rules/Rule-ClarifyOverSpecs-覆蓋掃描與配額.md`。
2. READ 讀取 `/specify` 的 `rules/Rule-Spec-Requirement-Traceability.md`，對照需求 ID 與章節是否一致。
3. THINK 依 Rule-覆蓋掃描與配額，對 spec 做 taxonomy 掃描（每類 Clear / Partial / Missing），產出內部覆蓋地圖；優先檢視「假設」章節中仍待確認或與正文可能衝突的項目。
4. THINK 依 Impact × Uncertainty 排序候選澄清題，整個 session 最多 5 題；已於正文或 `## 澄清紀錄` 中明確拍板的決策標為 Clear，不得重問。
5. THINK 純技術選型、框架版本、部署細節等若 spec 未承諾且不改變功能驗收，標記 Deferred，留待 `/technical-research`，不佔本 session 配額。

## Phase 2 -- 委派 clarify 訪談

1. THINK 若所有 Partial/Missing 皆為低影響，或澄清不會 materially 改變實作、驗收或資料模型，回報「無值得正式澄清的關鍵歧義」，建議進行 `/technical-research` 或下一 skill，不修改 spec。
2. DELEGATE 呼叫 `/clarify`，並明確傳遞：
   - 本輪要處理的 1 至 3 個已編號缺口（可引用 FR/NFR/BR/故事/假設原文）及對應 taxonomy 分類；
   - 要求 `/clarify` 依既有規則產出 Context、總結之提問與 Options，勿從零重做 taxonomy 掃描；
   - 是否詳記問答紀錄：預設 **否**（以 spec 內 `## 澄清紀錄` 為權威）；若使用者要求備份，設為 **是** 並指定與 spec 同目錄的 `clarify-log.md`。
3. READ 讀取 `/clarify` 回傳的已確認決策；若仍有高影響缺口且 session 累計未達 5 題，更新覆蓋地圖後再 delegate；若使用者 signal 完成（done、good、no more）則進入 Phase 4。

## Phase 3 -- 寫回 spec 並驗證

1. READ 讀取 `rules/Rule-ClarifyOverSpecs-決策寫回與一致性.md`。
2. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`spec.md`）。
3. WRITE 每輪 `/clarify` 收斂後，立即將決策寫入 spec：更新對應 FR/NFR/BR、User Story、邊界情況、成功標準、主要實體或假設；並在 `## 澄清紀錄` 下新增或沿用 `### Session YYYY-MM-DD`，追加 `- Q: … → A: …`。
4. WRITE 若澄清使先前模糊或矛盾敘述失效，**替換**該敘述，不得與新決策並存矛盾版本；已升級為已確認需求的假設應自「假設」移除或改寫為已確認陳述；產物 MUST 以憲法為最高優先。
5. DELEGATE 每次寫入後，從 `/specify` skill 根目錄重新執行 `uv run scripts/validate_spec.py <spec-path>`。
6. THINK 對照 Rule-決策寫回與一致性，做語意檢查：新答案是否消解對應缺口、需求 ID 追溯是否仍成立、術語是否一致；腳本通過不能取代此檢查。
7. EXEC **Phase Self-check**（artifact=`spec.md`）。
8. WRITE 若驗證、語意或憲法自檢失敗，修正 spec 後重跑，直到通過。

## Phase 4 -- 交付結束報告

1. WRITE 回報：本 session 詢問與採納的題數（≤5）、spec 路徑、修改過的章節名稱、`Constitution self-check: pass` 或 `exceptions`（格式見 artifact-overlay-sop）。
2. WRITE 提供覆蓋摘要：各 taxonomy 類別標示 Resolved（本 session 已處理）、Deferred（留待 plan/research）、Clear（已足夠）、Outstanding（仍 Partial/Missing 但低影響）。
3. WRITE 若仍有 Deferred 或 Outstanding，建議是否先 `/technical-research` 或日後再執行本 skill。
4. WRITE 建議下一指令：預設 `/technical-research`（若規格已足夠且無阻塞缺口）。
