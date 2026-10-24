# Rule：Truth Delta — Append Only

- Level: `MUST`
- 檔案：`PLAN_DIR/truth-delta.md`
- **唯一**可追加表格列的 skill：`/truth-delta`
- `/specify` 僅允許依 template **建立空骨架**，不得 append 資料列

## 小節與 owner_skill_id

| owner_skill_id | Markdown 小節 |
| --- | --- |
| `technical-research` | `## technical-research` |
| `data-plan` | `## data-plan` |
| `api-plan` | `## api-plan` |
| `dsl-refine` | `## dsl-refine` |

## 表格欄位

`Op` | `路徑／錨點` | `摘要` | `原因` | `Spec 追溯`

- `Op`：`ADD` | `MOD` | `DEL` 大寫
- `路徑／錨點`：Truth 路徑；可附錨點以分號分隔
- `DEL` 的 `原因` 須含 spec 或 clarify 依據（caller 在 owner Phase 1 已 clarify）

## Good Example

Owner 完成 `TRUTH_ROOT/contracts/http-api.yaml` 更新後：

```text
DELEGATE /truth-delta
owner_skill_id: api-plan
entries:
  - op: ADD
    path: specs/truth/contracts/http-api.yaml
    anchors: [openapi:createMerchantCategory]
    summary: 新增店家建立分類端點
    reason: US1 FR-001 需持久化分類
    spec_refs: [FR-001, US1]
```

## Bad Example

- Truth owner 直接編輯 `truth-delta.md` 表格
- `/truth-delta` 改寫 `## dsl-refine` 小節內 **其他 owner** 已寫入的列
