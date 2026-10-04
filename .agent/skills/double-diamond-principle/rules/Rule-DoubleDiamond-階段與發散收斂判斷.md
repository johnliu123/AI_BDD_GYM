# Rule 1 - 階段判斷必須依 Problem Statement 與原型證據順序決定

- Level: `MUST`
- 判斷順序固定，不可跳步：
  1. 無被認可的 solution-neutral Problem Statement → **Discover**（完全無研究）或 **Discover→Define 過渡**（有研究未收斂，須對照 Discover Exit）。
  2. 有 Problem Statement，但無任何「真實使用者測試過」的原型/方案 → **Develop**（發想與測試起點）。
  3. 有 ≥1 個測試過的原型，但未選定最終方案或未做 feasibility/viability → **Develop（收斂子階段）**。
  4. 已選定方案且 F/V 通過、準備上線 → **Deliver**。
  5. 已上線且在追蹤成效 → **完成**，下一週期可能新 Discover。
- 完整決策樹見 `references/workflow.md` Phase Detection；任何結論須能引用證據欄位（文件、測試紀錄、使用者回覆）。

## Good Example

- 這個例子是好的，因為依序檢查 statement 與測試證據後才判定 Develop。

````text
有 sign-off 的 Problem Statement，wireframe 尚未給使用者看 → 判定 Develop，非 Deliver。
````

## Bad Example

- 這個例子是壞的，因為有 PRD 草稿就假設已在 Deliver。

````text
內部 PRD 寫完 → 直接判定 Deliver 準備上線，忽略 Define/Develop Gate。
````

# Rule 2 - Diverge 與 Converge 不得僅憑時間壓力切換

- Level: `MUST`
- **仍應 Diverge** 當：洞察或方案候選的數量/多樣性不足以代表問題或方案空間（不只是第一個答案）。
- **可 Converge** 當：已有足夠證據（重複模式、測試結果、三角驗證）可安全刪選項而不遺漏重要可能性。
- **證據不足卻想收斂**：不得宣稱 Converge 完成；改做小規模驗證補缺口，或依 `Rule-DoubleDiamond-證據驗證.md` 標註證據等級並請使用者知情決定。
- 決策樹見 `references/workflow.md` Diverge vs Converge。

## Good Example

- 這個例子是好的，因為先補訪談直到主題重複才 affinity mapping。

````text
僅 1 次訪談 → 判定仍 Diverge → 再 3 次訪談出現重複主題 → 才 Converge。
````

## Bad Example

- 這個例子是壞的，因為 deadline 到了就停止發散。

````text
「明天要報告」→ 只 brainstorm 30 分鐘就選第一個方案 → Fake Divergence。
````

# Rule 3 - 對外說明階段時應使用證據語言而非強制術語

- Level: `SHOULD`
- 向使用者說明「現在在做什麼」時，優先描述證據狀態（例如「還沒跟使用者驗證過假設」），而非只丟 Discover/Define 標籤。
- 內部判斷仍須對應四階段 Gate，以便載入正確規則與 workflow 步驟。

## Good Example

- 這個例子是好的，因為用使用者聽得懂的方式對齊階段。

````text
「目前只有現象描述，還沒收斂成大家認可的問題定義，建議先做一輪訪談。」
````

## Bad Example

- 這個例子是壞的，因為要求使用者先懂 Double Diamond 才能回答。

````text
「你現在在 Discover 還是 Define？」（使用者未提供任何脈絡）
````
