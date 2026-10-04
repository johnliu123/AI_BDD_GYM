# Rule 1 - 實作順序依依賴而非檔案字母

- Level: `MUST`
- 開始 Phase 4 前，THINK 產出 **有序類別列表**：被其他類別引用或注入的型別／介面優先實作。
- 典型順序（依專案裁剪）：共用值物件／列舉 → 領域核心 → 介面／抽象 → 具體實作 → 门面／CLI／API 入口 → 組裝與 DI（若有）。
- 每步實作對應圖中一個節點（或一組緊耦合且已在圖中標示的節點群）。

## Good Example

- 這個例子是好的，因為先 Rule 再 Engine 再 App。

````text
順序：Move / Outcome（enum）→ RulePolicy → GameEngine → main CLI
````

## Bad Example

- 這個例子是壞的，因為先做 CLI 導致大量 stub。

````text
先寫 main 與 argparse，核心 GameEngine 仍不存在。
````

# Rule 2 - 施工過程保持與已確認圖一致

- Level: `MUST`
- 新建類別須出現在已確認的 Mermaid 中；新增方法若屬公開契約，應反映於圖中或於回報中說明為實作細節。
- 刪除或合併類別須先回到 Phase 3 修圖確認。

## Good Example

- 這個例子是好的，因為實作與圖同步。

````text
完成 GameEngine 後，公開方法與圖中 +playRound()、+getWinner() 一致。
````

## Bad Example

- 這個例子是壞的，因為圖外新增 Helper 承載核心邏輯。

````text
圖中只有 GameEngine，卻把規則邏輯全放在未出現在圖中的 utils.py。
````

# Rule 3 - 小步提交與可驗證增量

- Level: `SHOULD`
- 依序實作時，每完成一層應能編譯／執行或跑最小測試（依專案能力）；避免一次提交整張圖所有類別卻無法中間驗證。
- 向使用者更新進度時，標示「圖中已完成／進行中／未開始」。

## Good Example

- 這個例子是好的，因為增量可測。

````text
「✓ RulePolicy ✓ GameEngine → 進行 CLI；目前可跑單元測試 test_play_round。」
````

## Bad Example

- 這個例子是壞的，因為一次寫完才發現無法 import。

````text
一次新增 10 個檔案，最後才發現循環依賴。
````

# Rule 4 - 與其他 Skill 的銜接

- Level: `SHOULD`
- 實作完成若使用者要求 commit，DELEGATE `/git-conventional-commit`；分支策略依專案 DELEGATE `/trunk-based-development`。
- 需求仍模糊且影響類別邊界時，可 READ `/double-diamond-principle` 再回來修圖，但 **仍須** 本 skill 的 Phase 3 確認後才繼續寫碼。

## Good Example

- 這個例子是好的，因為先修需求再修圖再施工。

````text
Define 釐清 scope → 更新 Mermaid → 使用者 OK → 繼續 Phase 4。
````

## Bad Example

- 這個例子是壞的，因為跳過類別圖確認直接大改。

````text
雙鑽石 Define 後未更新類別圖就重寫整包程式。
````
