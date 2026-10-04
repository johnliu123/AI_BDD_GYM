---
name: skill-derive-rule
description: 給訂一個已經撰寫好 SOP 的 SKILL，使用者想要針對某個步驟，去展開該步驟需要遵守的規則，那此時就必須呼叫此 Skill。
---

# SOP

## Phase 1 -- 收斂指定步驟的規則需求

1. READ 讀取目標 skill 的 `SKILL.md`，定位使用者指定的 SOP step，並讀取其所在 phase、前後步驟及該步驟已載入的相關規則。
2. READ 若使用者指定要擴充既有 RuleFile，讀取 `rules/RuleFile-既有規則讀取.md`，並依其要求讀取目標 RuleFile 及其在 SOP 中的所有載入位置。
3. THINK 界定指定 step 的執行目的與預期產出，整理出會影響該 step 正確性的規則需求；流程動作的缺漏留在 SOP，判定標準才展開成 Rule。
4. THINK 判斷需求應新增 RuleFile 或擴充既有 RuleFile，並確認規則範圍只涵蓋指定 step，不重複既有規則。
5. THINK 若目標 step 或規則範圍仍有歧義，先向使用者確認再修改檔案。

## Phase 2 -- 建立或擴充 RuleFile

1. DELEGATE 呼叫 `/skill-form-rule`，依已收斂的規則需求，在目標 skill 的 `rules/` 下新增或修改 RuleFile，並完成該 skill 所要求的結構驗證。
2. READ 讀取更新後的 RuleFile 與驗證結果，確認內容涵蓋本次需求，且沒有擴大到其他 SOP step。

## Phase 3 -- 按需接回指定 SOP step

1. READ 讀取 `rules/SOP-規則按需接回.md`，依其判準接回並檢查 RuleFile。
2. DELEGATE 若 `/skill-form-rule` 尚未將 RuleFile 接回 SOP，委派 `/skill-form-sop` 修改目標 skill 的 SOP。
3. THINK 檢查 SOP 變更前後：只在指定 step 確實需要該規則時，於該 step 執行前加入條件式 `READ`；指定 step 則依已載入規則執行。
4. READ 重新讀取目標 skill 的 SOP，確認新增的 RuleFile 在使用時才載入、載入位置緊鄰指定 step，且其他 phase、step 與規則載入時機未被不必要地改動。
