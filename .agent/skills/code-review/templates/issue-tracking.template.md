# 問題追蹤工作項：{finding_id} - {finding_title}

> 來源報告：`{report_path}`（對應 Findings 詳情中的 `{finding_id}`）

## 流程狀態

`發現 → 確認 → 評估風險 → 提出修正方案 → 執行修正 → 撰寫/更新測試 → 重新分析 → 確認結果 → 結案`

**目前階段**：`{current_stage}`

| 階段 | 完成日期 | 負責人 | 備註 |
|------|---------|--------|------|
| 發現 | `{date}` | `{owner}` | 來源：{工具名稱／人工審查／AI 輔助} |
| 確認 | `{date_or_pending}` | `{owner}` | 確認層級：{已確認｜疑似｜建議}；依 `rules/Rule-CodeReview-證據與確認層級.md` |
| 評估風險 | `{date_or_pending}` | `{owner}` | 嚴重度：`{severity}`；排序理由：`{priority_reason}` |
| 提出修正方案 | `{date_or_pending}` | `{owner}` | 方案摘要：`{fix_plan_summary}` |
| 執行修正 | `{date_or_pending}` | `{owner}` | commit/PR：`{commit_or_pr_ref}` |
| 撰寫/更新測試 | `{date_or_pending}` | `{owner}` | 測試名稱：`{test_name}`；修正前應失敗、修正後應通過 |
| 重新分析 | `{date_or_pending}` | `{owner}` | 重跑結果：`{rerun_result}` |
| 確認結果 | `{date_or_pending}` | `{owner}` | 既有測試套件：`{pass_count}/{total_count}` 通過 |
| 結案 | `{date_or_pending}` | `{owner}` | 結案類型：{已解決｜部分修正（風險已接受）} |

## 風險接受記錄（僅當結案類型為「部分修正」時填寫）

- 殘餘風險內容：`{residual_risk}`
- 風險接受人：`{risk_acceptor}`
- 接受理由：`{acceptance_reason}`
- 下次覆核時間：`{review_date}`

## 誤報／重複檢查紀錄

- 是否與其他 finding 重複：{否｜是，已合併至 `{merged_finding_id}`}
- 是否曾被判定為誤報後又重新開啟：{否｜是，原因：`{reopen_reason}`}

## 變更追蹤

| 日期 | 動作 | 說明 |
|------|------|------|
| `{date}` | `{action}` | `{description}` |
