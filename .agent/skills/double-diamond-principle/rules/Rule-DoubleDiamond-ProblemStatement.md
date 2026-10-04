# Rule 1 - Problem Statement 必須 solution-neutral 且使用規定句型

- Level: `MUST`
- 句型：「**[使用者]** 在 **[情境]** 中，需要 **[需求]**，但 **[障礙/落差]**。」
- **禁止**在 statement 中預埋解法（例如 onboarding、推播、AI、新 dashboard 等具體手段），除非該手段已是不可拆的約束且須在文件註明。
- HMW 須由 Problem Statement 衍生，**不得**在 HMW 中偷偷鎖定單一解法路徑（見 `references/anti-patterns.md` HMW 預埋解法）。

## Good Example

- 這個例子是好的，因為描述需求與落差，未指定產品手段。

````text
「重度依賴單一功能的團隊，在續訂前，需要感受到持續價值，但現有體驗無法傳達超出該功能的收益。」
````

## Bad Example

- 這個例子是壞的，因為 statement 已是解法。

````text
「使用者需要更好的 onboarding 導覽來提高留存。」
````

# Rule 2 - 定義產出須與 Design Brief 及成功指標一併對齊

- Level: `MUST`
- Define 階段 sign-off 前，Problem Statement、優先 HMW、Design Brief、成功指標須**互相一致**（同一使用者、同一問題範圍、KPI 可衡量）。
- 模板結構見 `templates/design-definition-pack.md`；填寫時須標註證據來源（訪談、數據、文件連結）。

## Good Example

- 這個例子是好的，因為 KPI 直接對應 statement 中的落差。

````text
Statement 談「感受不到持續價值」→ KPI：90 天留存、次要功能採用率 → Brief 範圍不含定案 UI。
````

## Bad Example

- 這個例子是壞的，因為 KPI 與問題無關。

````text
Problem 談續訂價值感 → KPI 設「首頁載入秒數」→ 未對齊。
````

# Rule 3 - 多個候選 Problem Statement 須先並列再收斂

- Level: `SHOULD`
- Define 收斂前應至少產出 **2** 個不同 framing 的候選 statement（除非證據已強烈指向單一 framing）。
- 收斂時須說明淘汰理由（證據不足、範圍過窄、與 KPI 無關等），不是只留第一個寫出來的版本。

## Good Example

- 這個例子是好的，因為並列候選並用證據淘汰。

````text
候選 A「價格敏感」vs B「價值感不足」→ 訪談支持 B → 選 B 並記錄淘汰 A 的理由。
````

## Bad Example

- 這個例子是壞的，因為只寫一個版本就 sign-off。

````text
第一次 brainstorm 的第一句話 → 直接當最終 Problem Statement。
````
