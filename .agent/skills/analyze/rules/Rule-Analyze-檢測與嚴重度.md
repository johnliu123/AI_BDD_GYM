# Rule 1 - 檢測類別與信號

- Level: `MUST`
- 分析 MUST 涵蓋下列類別（ID 前綴見括號）；每類至少掃描一次，無問題可略過表格列但須在指標中反映零計數。
- **A 重複（Duplication）**：近義 FR／NFR／BR；同一跨故事需求在多處定義不同 ID。
- **B 歧義（Ambiguity）**：無量測的模糊形容詞（快速、直覺、安全、可擴展等）且無 NFR／SC；TODO、TKTK、`???`、未替換佔位符。
- **C 欠規格（Underspecification）**：有動詞無對象或驗收；User Story 缺 GWT 或與 FR 脫節；tasks 描述缺檔案路徑或不可執行。
- **D 憲法對齊（Constitution）**：違反憲法 MUST 或 artifact registry 加嚴；缺 mandated 章節／欄位（可交叉 `validate_spec.py`）。
- **E 覆蓋缺口（Coverage）**：FR／NFR／BR（baseline 功能）無任務映射；需建置的 SC 無任務；tasks 中 Tnnn 無法對應任何需求或故事。
- **F 不一致（Inconsistency）**：術語漂移；plan 實體／端點與 spec 矛盾；tasks Phase 順序與 plan Wave 或依賴矛盾；技術堆疊衝突（如 plan 與 techstack 版本矛盾）。
- **G 錨點與 Binding（Tasks binding）**：必讀對照列無任務引用；任務 `←` 指向不存在檔案或明顯錯誤錨點；openapi／dbml 錨點與契約檔不一致（按需 READ 驗證）。

## Good Example

- 這個例子是好的，因為它用 E 類標需求無任務，並引用 FR ID。

```text
E1 | Coverage | HIGH | spec.md FR-012 | 無 Tnnn 引用 spec:FR-012 或 US3 後端小節 | 在 US3 增補任務或確認 out-of-scope |
```

## Bad Example

- 這個例子是壞的，因為只數 FR 個數，未對照 tasks 錨點與故事。

```text
spec 有 12 條 FR，tasks 有 40 條，應該夠了。
```

# Rule 2 - 嚴重度 heuristics

- Level: `MUST`
- **CRITICAL**：違反憲法 MUST；缺 spec／plan／tasks 任一必備檔；baseline 核心 FR／BR 零覆蓋且阻擋 MVP；spec 結構驗證失敗且影響追溯。
- **HIGH**：互相衝突的需求或 plan 決策；安全／效能相關歧義；不可測驗收；duplicate 正式需求 ID；必讀對照雙向覆蓋明顯失敗。
- **MEDIUM**：術語漂移；非核心 SC 缺任務；邊界情況欠規格；research／techstack 缺檔但 tasks 已引用（前置閘門問題）。
- **LOW**：用字冗餘、輕微重複不影響執行順序、風格建議。

## Good Example

- 這個例子是好的，因為憲法衝突直接 CRITICAL。

```text
D1 | Constitution | CRITICAL | tasks.md | 說明文字混用簡體 | 改繁中或修憲 |
```

## Bad Example

- 這個例子是壞的，因為 FR 完全無任務卻標 LOW。

```text
E5 | Coverage | LOW | FR-001 無任務 | 之後再說 |
```

# Rule 3 - 輸出效率與上限

- Level: `MUST`
- findings 主表最多 **50** 列；其餘以「Overflow 摘要」列類別與件數。
- 優先輸出可執行建議（指向檔案、ID、錨點、建議 skill），避免貼上大段原文。
- 零 issue 時仍 MUST 輸出覆蓋摘要表與指標區塊。

## Good Example

- 這個例子是好的，因為它聚合低優先問題並給出覆蓋率。

```text
Overflow：LOW 用字建議 8 件（未逐列）。
Coverage %：FR 94%（18/19）；Critical Issues：0。
```

## Bad Example

- 這個例子是壞的，因為 dump 三份文件全文到報告。

```text
以下為 spec.md 全文……
```
