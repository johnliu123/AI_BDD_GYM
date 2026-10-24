---
name: truth-delta
description: 在 Truth owner 套用 specs/truth 變更後，於 PLAN_DIR/truth-delta.md 追加 ADD/MOD/DEL 紀錄；唯一允許寫入 delta 表格的 skill（/specify 僅初始化空骨架）。
license: MIT
license-file: LICENSE.txt
attribution: "SDD Plan/Truth workflow"
---

# Truth Delta

**唯一寫入** `PLAN_DIR/truth-delta.md` 表格列的 skill。Truth owner（`/technical-research`、`/data-plan`、`/api-plan`、`/dsl-refine`）在 **Apply Truth 成功後** DELEGATE 本 skill；**不得**自行改寫 delta 表格。

引用：`../../references/plan-truth-workflow.md`、`rules/Rule-Truth-Delta-Append-Only.md`。

## 輸入契約（由 caller 提供）

| 欄位 | 必填 | 說明 |
| --- | --- | --- |
| `PLAN_DIR` | 是 | 作用中 plan 目錄（`specs/plans/<id>/`） |
| `owner_skill_id` | 是 | `technical-research` \| `data-plan` \| `api-plan` \| `dsl-refine` |
| `entries` | 是 | 本輪 **一筆或多筆** 變更（一次 owner 執行 = **一次** DELEGATE） |

每筆 `entry`：

| 欄位 | 必填 | 說明 |
| --- | --- | --- |
| `op` | 是 | `ADD` \| `MOD` \| `DEL` |
| `path` | 是 | Truth 內路徑（建議 repo 根：`specs/truth/...`） |
| `anchors` | 否 | 如 `openapi:payOrder`、`dbml:Table orders`、`feature:specs/truth/features/...#Example` |
| `summary` | 是 | 一句話改動摘要 |
| `reason` | 是 | 為何改；**DEL** 須引用 spec 或 `/clarify` 決策 |
| `spec_refs` | 是 | 如 `FR-001`、`US2`、`BR-003` |

## SOP

### Phase 1 — 解析與閘門

1. READ `PLAN_DIR/truth-delta.md`；若不存在 **STOP**（請先 `/specify` 或初始化 template）。
2. THINK 驗證 `owner_skill_id` 為允許的 Truth owner；`entries` 非空。
3. THINK 對每筆 **DEL**：`reason` MUST 可追溯到 `PLAN_DIR/spec.md` 需求刪除或本輪 clarify 決策；否則 **STOP**，請 caller 先 `/clarify`。
4. THINK 對每筆 **MOD**：若 `anchors` 暗示破壞既有契約／錨點，`reason` MUST 含 clarify 或 spec 明示；否則 **STOP**。

### Phase 2 — 追加表格列

1. READ `templates/truth-delta.template.md` 確認表頭與小節標題。
2. WRITE 僅修改 `## {owner_skill_id}` 小節：若小節不存在則建立表頭；**移除**該表「*(尚無)*」占位列（若存在）。
3. WRITE **APPEND** 列（Op | 路徑／錨點 | 摘要 | 原因 | Spec 追溯）；**禁止**改寫其他 owner 小節、禁止刪除歷史列。

### Phase 3 — 交付

1. WRITE 回報 `PLAN_DIR/truth-delta.md`、本次 `owner_skill_id`、新增列數與列內容摘要。
2. WRITE 提醒下游：`/tasks`、`/analyze`、`/implement` MUST READ `truth-delta.md` 全文後再按需 READ Truth。

## MUST NOT

- 修改 `specs/truth/**` 本體（屬 Truth owner）。
- 由 `/specify` 以外流程初始化 skeleton 時寫入資料列（`/specify` 只 COPY template，不 append）。
- 分多次 DELEGATE 拆分同一 owner 同一輪 entries（caller 應一次傳完 `entries[]`）。
