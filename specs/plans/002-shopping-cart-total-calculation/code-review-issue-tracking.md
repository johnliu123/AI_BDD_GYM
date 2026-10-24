# Code Review 修正追蹤

來源：本次對購物車迭代的基線審查；日期：2026-10-13。

| Finding | 狀態 | 修正／驗證證據 |
|---|---|---|
| F1 前端購物車流程缺失（HIGH） | 已解決 | 新增 cart API client、規格選擇、檢視、改量與刪除；瀏覽器完成新增、改量及刪除流程。 |
| F2 無期限匿名 session（HIGH） | 修正中 | 記憶體 store 加入閒置／絕對期限、最大 session 數及滿載 503；測試通過。此為緩解，不代表正式持久化 store 已完成。 |
| F3 session／購物車無持久化（HIGH） | 待處理 | 需接合 PostgreSQL store 與購物車資料模型；本機無 PostgreSQL driver、連線設定或可用 Docker daemon，無法安全實作及驗證。 |
| F4 已停用規格仍可計價（HIGH） | 已解決 | 重新計算可用性、拒絕失效項目改量，失效項目排除金額並保留所選規格名稱；回歸測試通過。 |
| F5 cart 回應缺少 no-store（MEDIUM） | 已解決 | cart 路由統一設定 `Cache-Control: no-store`；API 測試驗證。 |
| F6 GET 造成 CSRF token 失效（MEDIUM） | 已解決 | session token 在讀取間保持穩定；回歸測試驗證。 |
| F7 未知／停用 option ID 被接受（LOW） | 已解決 | 驗證每個提交 ID 唯一、有效且恰好對應各規格群組；回歸測試驗證。 |
| F8 跨 Origin CORS（疑似） | 已解決 | 加入精確來源 allowlist、credentials 與 OPTIONS preflight；允許與拒絕來源測試通過。 |

## 尚待完成

- F2 仍依賴單一程序的記憶體 store；容量限制只是緩解，不能替代 server-side PostgreSQL store。
- F3 需確認 PostgreSQL 可用性、菜單 UUID/schema 映射、session store 套件與 idle／absolute timeout 政策後實作及整合測試。