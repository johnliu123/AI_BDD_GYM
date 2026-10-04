# Rule 1 - Discover 離開前必須滿足三項 Exit Criteria

- Level: `MUST`
- **Entry**：有初始問題/機會敘述（可模糊）；有可接觸的使用者或資料來源。
- **Exit（→ Define）** 須全部滿足：① 研究涵蓋目標使用者、關鍵關係人、使用情境；② 洞察出現重複模式（飽和度依 `Rule-DoubleDiamond-證據驗證.md` 與專案規模）；③ 能列出候選機會領域，非空白。
- **Diverge 原則**：廣度優先、不篩選不評判；質化＋量化三角驗證；保留矛盾證據，不提早調成單一結論。
- **Output 最低集**：原始研究紀錄、insight 清單、候選機會領域清單。

## Good Example

- 這個例子是好的，因為三項 Exit 都有對應產物且可對照檢查。

````text
3 次取消客戶訪談 + CRM 分布 → 重複主題「只用單一功能」→ 列出 2 個機會領域 → 可進 Define。
````

## Bad Example

- 這個例子是壞的，因為只有內部討論共識，沒有涵蓋使用者與重複模式。

````text
團隊開會覺得問題是「太貴」→ 直接寫 Problem Statement，跳過 Discover Exit。
````

# Rule 2 - Define 離開前必須有認可的 solution-neutral 問題定義

- Level: `MUST`
- **Entry**：Discover Exit 已達成。
- **Exit（→ Develop）** 須全部滿足：① 關係人認可的 solution-neutral Problem Statement；② 優先排序的 HMW 清單；③ 可衡量成功指標；④ 對「要解的問題」sign-off。
- **Converge 原則**：affinity mapping 分群；Problem Statement 句型與禁解法規則見 `Rule-DoubleDiamond-ProblemStatement.md`；主動篩掉低優先機會。
- **Output 最低集**：Problem Statement、HMW、Design Brief、成功指標草稿。

## Good Example

- 這個例子是好的，因為 statement 無解法、有 HMW 與 KPI，且使用者確認。

````text
「中小型團隊在續訂前感受不到超出單一功能的價值…」→ HMW 排序 → 90 天留存 KPI → 使用者 sign-off。
````

## Bad Example

- 這個例子是壞的，因為 Problem Statement 內嵌解法且無 sign-off。

````text
「使用者需要更好的 onboarding 流程」→ 未確認 KPI → 直接進 Develop。
````

# Rule 3 - Develop 離開前必須依規模滿足原型與測試門檻

- Level: `MUST`
- **Entry**：Define Exit 已達成。
- **Exit（→ Deliver）** 須全部滿足：① 原型/概念測試門檻（見 `Rule-DoubleDiamond-證據驗證.md` 的 Develop→Deliver）；② 證據指向明確優選方向；③ Feasibility 與 Viability 已確認；④ 主要風險有對策；⑤ MVP 範圍與驗收標準明確。
- **Diverge 原則**：先求數量、defer judgement；**只做一個原型就收斂**視為違規（見 `references/anti-patterns.md`）。
- **Output 最低集**：多概念測試紀錄、feasibility/viability 結論、風險清單、MVP 與驗收標準。

## Good Example

- 這個例子是好的，因為標準規模下兩個差異化概念都有使用者測試與 F/V 檢查。

````text
概念 A/B wireframe 測試各 5 人 → B 勝出 → 技術與商業可行確認 → MVP 範圍文件化 → 可 Deliver。
````

## Bad Example

- 這個例子是壞的，因為僅內部評審、無真實使用者測試。

````text
設計師與 PM 投票選方案 → 未做使用者測試 → 宣稱 Develop Exit 達成。
````

# Rule 4 - Deliver 完成時必須上線並建立回饋循環

- Level: `MUST`
- **Entry**：Develop Exit 已達成。
- **Exit（完成）** 須全部滿足：① 已上線/交付；② 回饋機制就位；③ 成效指標在追蹤；④ 學習已文件化供下一週期 Discover。
- **Converge 原則**：最終測試與去風險化、明確 sign-off；**上線是回饋循環開始，不是專案結束**。

## Good Example

- 這個例子是好的，因為交付後仍有指標與回饋管道。

````text
上線推薦功能 → dashboard 追蹤 90 日留存 → 客服/問卷入口 → 事後學習寫入 wiki。
````

## Bad Example

- 這個例子是壞的，因為上線後無監測、無學習紀錄。

````text
功能 merge 即視為完成，未定義成功指標或回饋機制。
````
