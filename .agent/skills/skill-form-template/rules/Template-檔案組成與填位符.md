# Rule 1 - 每組模板必須包含命名成對的骨架與範例

- Level: `MUST`
- 每組模板必須放在目標 skill 的 `templates/` 目錄，並包含 `<模板名字>.<格式>` 骨架及 `<模板名字>.example.<格式>` 範例。
- 骨架與範例必須使用相同的模板名字與格式副檔名。

## Good Example

- 這個例子是好的，因為骨架與範例位於目標 skill 的 `templates/`，且名稱只有範例檔多出 `.example`。

````text
目標 skill/
└── templates/
    ├── class-diagram.mmd
    └── class-diagram.example.mmd
````

## Bad Example

- 這個例子是壞的，因為只有骨架檔，缺少與它成對的範例檔。

````text
目標 skill/
└── templates/
    └── class-diagram.mmd
````

# Rule 2 - 範例必須以具體值替換骨架中的所有填位符

- Level: `MUST`
- 骨架中的可變內容必須以 `{{placeholder_name}}` 標示，名稱須能辨識要填入的內容。
- 範例必須保留骨架的固定結構，並將每個填位符替換為具體且符合格式的示範值，不可留下未替換的填位符。

## Good Example

- 這個例子是好的，因為範例保留骨架結構，並將兩個填位符都換成具體值。

````text
骨架：
classDiagram
    class {{class_name}} {
        +{{method_name}}()
    }

範例：
classDiagram
    class OrderService {
        +createOrder()
    }
````

## Bad Example

- 這個例子是壞的，因為範例仍留下未替換的 `{{method_name}}`。

````text
骨架：
classDiagram
    class {{class_name}} {
        +{{method_name}}()
    }

範例：
classDiagram
    class OrderService {
        +{{method_name}}()
    }
````
