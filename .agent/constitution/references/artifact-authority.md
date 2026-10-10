# Artifact Constitution Authority

## 適用範圍

- 只約束 **registry 內產物** 的內容（章節、欄位、schema、文案等）。
- **不** 改寫各 skill 的 Phase 順序、委派邊界、何時 `/clarify`、是否跑腳本。

## 優先序（產物內容 MUST 衝突時）

1. **憲法** `shared/` + `skills/<skill_id>/<artifact>`（`CONSTITUTION.md` 登錄且 `status: active`）
2. 該 skill 的 `rules/` 與 `templates/` 中的 MUST
3. Template 骨架（憲法不得刪除 template 必填章節；可透過憲法 MUST **加嚴**）

同一主題若憲法 MUST 與 skill MUST **不可兩立**：**STOP**，請 `/clarify` 或 `/constitution` 修憲／修 rule；禁止 silent 忽略任一方。

憲法對某 artifact **未登錄** 或模組 **不存在**：僅 skill rules + template。

## Registry 入口

`.agent/constitution/CONSTITUTION.md` — 版本、Shared 表、Artifacts 表。
