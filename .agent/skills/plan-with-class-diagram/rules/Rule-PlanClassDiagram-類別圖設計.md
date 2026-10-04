# Rule 1 - 類別圖只服務本次開發範圍

- Level: `MUST`
- 圖中每個類別須能對應本次需求中的責任或驗收項；不為「完整性」畫未在本次實作的周邊系統。
- 若需預留擴充，以註解或 `<<interface>>`／抽象類別標示，並在提案的 out of scope 列出。

## Good Example

- 這個例子是好的，因為只含猜拳核心與明確排除 UI。

````text
in scope: Game, Player, RuleEngine
out of scope: 排行榜、帳號系統
````

## Bad Example

- 這個例子是壞的，因為為小功能畫滿整個 enterprise 分層。

````text
一次畫 Controller / Service / Repository / DTO / EventBus 但本次只做 CLI 猜拳。
````

# Rule 2 - Mermaid 類別圖必備元素

- Level: `MUST`
- 提案中的 Mermaid 區塊須使用 `classDiagram`。
- 每個 **本次將新建或明顯改動** 的類別，至少列出：
  - 類別名（與目標語言命名風格一致）
  - 2–5 個 **關鍵** 方法或屬性（公開為主；細節實作可省略）
- 類別之間須標示至少一種關係：`<|--` 繼承、`<|..` 實作、`-->` 關聯／依賴、`*--` 組合、`o--` 聚合（依實際語意選用）。
- 圖中類別名須與預期檔名／模組路徑可對應（在設計說明中一句話交代即可）。

## Good Example

- 這個例子是好的，因為關係與關鍵 API 清楚。

````mermaid
classDiagram
    class GameEngine {
        +playRound()
        +getWinner()
    }
    class RulePolicy {
        <<interface>>
        +beats(a, b)
    }
    GameEngine --> RulePolicy
````

## Bad Example

- 這個例子是壞的，因為只有類別名、無方法、無關係。

````mermaid
classDiagram
    class Foo
    class Bar
````

# Rule 3 - 對齊專案既有慣例

- Level: `SHOULD`
- 盤點 repo 後，類別命名、分層（如 domain / infra）、是否用 interface／protocol，應優先跟隨既有程式，不在提案中無故引入新風格。
- 若專案尚無慣例，在設計說明中簡述採用的命名與分層理由。

## Good Example

- 這個例子是好的，因為延用既有 `services/` 與 snake_case 模組。

````text
沿用 src/services/ 與現有 OrderService 命名模式。
````

## Bad Example

- 這個例子是壞的，因為 Java 式 PascalCase 套在既有 Python snake 專案。

````text
全新引入 OrderServiceHandlerFactory 於全 snake_case 專案且無說明。
````

# Rule 4 - 提案須標示假設

- Level: `SHOULD`
- 在模板「假設」段落列出：持久化方式、執行緒／同步、外部 API、錯誤處理層級等尚未在需求中寫死但影響類別切分的決定。
- 假設若錯誤可能改圖，應在 Phase 3 一併請使用者確認或修正。

## Good Example

- 這個例子是好的，因為假設可被查證。

````text
假設：單機記憶體狀態、無 DB；錯誤以例外往上拋。
````

## Bad Example

- 這個例子是壞的，因為假設 DB 與快取卻未寫在提案中。

````text
圖中有 Repository，但未說明是否有真實資料庫。
````
