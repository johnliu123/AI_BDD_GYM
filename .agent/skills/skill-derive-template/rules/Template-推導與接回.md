# Rule 1 - 模板必須承載指定步驟的輸出格式而非完整規則

- Level: `MUST`
- 模板必須從指定 SOP step 的預期輸出擷取固定結構，並以填位符標示需要替換的內容。
- 不可把整段流程指示、品質判準或背景說明當成模板內容；這些內容應留在 SOP 或 RuleFile。

## Good Example

- 這個例子是好的，因為模板只保留 class diagram 的輸出結構，並標出需依需求替換的類別與方法名稱。

````text
classDiagram
    class {{class_name}} {
        +{{method_name}}()
    }
````

## Bad Example

- 這個例子是壞的，因為模板混入了操作流程與品質規則，而不是提供可填寫的輸出格式。

````text
先閱讀需求，再確認類別之間的關係。
每個類別都必須有清楚的職責，且關係不可過度複雜。
````

# Rule 2 - SOP 必須在指定步驟前列出骨架與範例的完整路徑

- Level: `MUST`
- 接回模板時，必須在指定 step 前加入 `READ`，明確列出骨架與範例兩個檔案的路徑；不可只列其中一個。
- 指定 step 必須說明依骨架填入內容，並參照範例完成產出。
- 若只有在特定情況才執行指定 step，`READ` 與產出 step 必須使用相同觸發條件。

## Good Example

- 這個例子是好的，因為 `READ` 同時列出成對檔案，且載入與產出使用相同條件；產出步驟也說明如何使用兩個檔案。

````md
2. READ 若本次需要繪製 class diagram，讀取 `templates/class-diagram.mmd` 與 `templates/class-diagram.example.mmd`。
3. WRITE 若本次需要繪製 class diagram，依骨架填入內容並參照範例產出 class diagram。
````

## Bad Example

- 這個例子是壞的，因為 `READ` 只列出骨架路徑，執行者無法得知範例檔的位置。

````md
2. READ 若本次需要繪製 class diagram，讀取 `templates/class-diagram.mmd`。
3. WRITE 若本次需要繪製 class diagram，依骨架填入內容並參照範例產出 class diagram。
````
