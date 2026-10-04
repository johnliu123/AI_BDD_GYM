# 法：規則索引（RuleFile）

執行層判斷標準已遷移至 `rules/` 目錄的 RuleFile；SOP 會在對應 Phase **按需** `READ`，請勿一次載入全部。

| RuleFile | 內容 | 典型載入時機 |
|---|---|---|
| [Rule-TBD-Branch與Merge.md](../rules/Rule-TBD-Branch與Merge.md) | Trunk 中心、分支策略、短命分支、同步、整合頻率 | Phase 1、4 |
| [Rule-TBD-Commit與Review.md](../rules/Rule-TBD-Commit與Review.md) | Commit 粒度、委派 commit skill、Review、CI gate | Phase 3、4 |
| [Rule-TBD-CI與Release.md](../rules/Rule-TBD-CI與Release.md) | Trunk 變紅、CI 速度、Release、merge queue | Phase 4、5 |
| [Rule-TBD-解耦與Flag.md](../rules/Rule-TBD-解耦與Flag.md) | Feature Flag / BbA / Dark Launch、flag 治理 | Phase 2、5 |
| [Rule-TBD-Git操作與互動.md](../rules/Rule-TBD-Git操作與互動.md) | 何時問、可自動做、高風險 Git、證據回報 | Phase 0–5 |
| [Rule-TBD-例外與健康度.md](../rules/Rule-TBD-例外與健康度.md) | Hotfix、schema、健康度報告、Gitflow 遷移 | Phase 1、5 |

**前提**：trunk 名稱以 Phase 0 腳本/摘要為準，不要假設一定是 `main`。

教學性長文與 DORA 脈絡見 [principles.md](principles.md)；逐 Stage 流水線見 [workflow.md](workflow.md)。
