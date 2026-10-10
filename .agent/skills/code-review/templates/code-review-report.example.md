# 程式碼審查報告

**專案名稱**：`order-service`
**分析日期**：`2026-10-10T22:00:00+08:00`
**分析範圍**：PR #128 diff 分析（變更檔案：`src/orders/*.py`, `src/orders/routes.js`, `requirements.txt`）；資料庫 migration 與前端 UI 元件不在本次範圍
**使用工具**：Semgrep 1.9x（SAST）、Bandit 1.7.x（Python SAST）、Trivy 0.6x（SCA）、Gitleaks 8.2x（Secret Scanning）、pytest + coverage.py（測試）
**採用規範版本**：OWASP ASVS v5.0.0 Level 2、OWASP Top 10:2025、CWE 2025 Top 25、CVSS v4.0

## 分析摘要與整體風險概況

本次 PR 新增訂單查詢端點，發現 1 筆已確認的 High 等級 SQL Injection（CWE-89），1 筆疑似 N+1 Query 效能問題待確認，1 筆已確認的過時高風險相依套件，以及 1 筆程式碼可讀性建議。建議修復 CRITICAL/HIGH 等級已確認問題後再合併，其餘可排入後續迭代。

## 問題總覽

| 嚴重度 | 已確認 | 疑似 | 建議 | 合計 |
|--------|--------|------|------|------|
| CRITICAL | 0 | 0 | — | 0 |
| HIGH | 2 | 0 | — | 2 |
| MEDIUM | 0 | 1 | — | 1 |
| LOW | 0 | 0 | 1 | 1 |

| 問題類型 | 數量 |
|---------|------|
| 程式邏輯問題 | 0 |
| 潛在 Bug | 0 |
| 資安弱點 | 2 |
| 程式碼品質問題 | 1 |
| 效能與資源管理問題 | 1 |
| 相依套件與設定風險 | 1（計入資安弱點 HIGH 其中一筆） |

| 修正狀態 | 數量 |
|---------|------|
| 待處理 | 3 |
| 修正中 | 0 |
| 已解決（已驗證） | 0 |
| 部分修正（風險已接受） | 0 |

## 快速總覽（P0／P1）

> 本區為「Findings 詳情」的精簡索引，供快速瀏覽／PR 留言使用；對照規則見 `rules/Rule-CodeReview-P0P1摘要與檢查清單使用.md`。

### 🔴 必須修正（P0）

1. **訂單查詢端點存在 SQL Injection**（`src/orders/routes.js` Line 42-46，對應 F1）

    ```javascript
    // ❌ 目前：req.params.id 未經檢核直接拼接進 SQL 字串
    const query = `SELECT * FROM orders WHERE id = ${req.params.id}`;
    db.query(query, (err, rows) => res.json(rows));

    // ✅ 建議：改用參數化查詢，並加入擁有權檢查
    const query = `SELECT * FROM orders WHERE id = ? AND user_id = ?`;
    db.query(query, [req.params.id, req.user.id], (err, rows) => res.json(rows));
    ```

    **影響範圍**：
    - `src/orders/routes.js`：任何未驗證使用者皆可讀取他人訂單資料（橫向越權）
    - 無其他模組共用此端點，影響範圍限於訂單查詢功能

2. **相依套件 `lodash@4.17.15` 存在已知高風險弱點（Prototype Pollution）**（`package.json` Line 18，對應 F2）

    ```diff
    - "lodash": "4.17.15"
    + "lodash": "^4.17.21"
    ```

    **影響範圍**：
    - `src/orders/utils.js`：`merge()` 實際用於處理前端傳入的篩選條件物件，具備可觸發路徑
    - 升級為 minor/patch 版本，預期不影響既有 API 行為，仍須重跑既有測試確認

### 🟡 建議修正（P1）

無（本次無「已確認」且嚴重度 MEDIUM／LOW 的項目）。

### ⏳ 待確認疑似問題

1. **訂單列表查詢疑似 N+1 Query**（F3）：`list_orders_with_items` 疑似逐筆查詢 `OrderItem`，待維運團隊提供訂單筆數分布後確認是否需優先處理；尚未人工確認觸發規模，不貼 P0/P1 標籤。

### 💡 其他改善建議

1. **`list_orders_with_items` 函式職責過多**（S1）：建議拆分為查詢／計算／排序三個函式以提升可讀性與可測試性，非合併阻斷項目。

## Findings 詳情

### F1 - 訂單查詢端點存在 SQL Injection

- **類型**：資安弱點
- **確認層級**：已確認
- **嚴重度**：HIGH（簡化估算：未驗證輸入可讀取非擁有者的訂單資料，攻擊者無需特殊權限即可觸發，非正式 CVSS Base Score）
- **位置**：`src/orders/routes.js`　類別／方法：`getOrderById`　行號：`42-46`

**證據／可重現程式碼片段**

```javascript
app.get("/orders/:id", (req, res) => {
  const query = `SELECT * FROM orders WHERE id = ${req.params.id}`;
  db.query(query, (err, rows) => res.json(rows));
});
```

**成因、觸發條件與可能影響**

`req.params.id` 未經任何檢核或參數化即直接拼接進 SQL 字串。已於本機以 `GET /orders/1 OR 1=1` 重現，回應回傳資料表全部訂單（含其他使用者資料），證實可繞過應僅能查詢自己訂單的預期行為。

**對應依據**

- 規範／標準：OWASP Top 10:2025 A05 Injection；OWASP ASVS v5.0.0 §5（Validation, Sanitization and Encoding）
- CWE：CWE-89（Improper Neutralization of Special Elements used in an SQL Command）

**建議修正方式**

改用參數化查詢，並在查詢條件加入目前登入使用者的擁有權檢查，避免橫向越權。

```diff
-  const query = `SELECT * FROM orders WHERE id = ${req.params.id}`;
-  db.query(query, (err, rows) => res.json(rows));
+  const query = `SELECT * FROM orders WHERE id = ? AND user_id = ?`;
+  db.query(query, [req.params.id, req.user.id], (err, rows) => res.json(rows));
```

**修正資訊**

- 優先順序：1（任何未登入驗證即可觸發，攻擊面大，優先於 F2）
- 負責人：`陳大文`
- 狀態：待處理
- 預計完成時間：`2026-10-14`

**驗證方式與結果**

- 重跑分析／工具：尚未修正，待修正後重跑 Semgrep `sql-injection-raw-query` 規則
- 新增／更新回歸測試：待補 `test_get_order_blocks_sql_injection_and_cross_user_access()`
- 既有測試套件：尚未重跑
- 殘餘風險：（待修正後評估）

---

### F2 - 相依套件 `lodash@4.17.15` 存在已知高風險弱點

- **類型**：相依套件與設定風險
- **確認層級**：已確認
- **嚴重度**：HIGH（CVSS v4.0 參考分數 7.5，依套件公告原始分數引用，非本專案自行估算）
- **位置**：`requirements.txt` → 實為 `package.json`　類別／方法：—　行號：`18`

**證據／可重現程式碼片段**

```text
Trivy 掃描結果：
lodash 4.17.15 — Prototype Pollution — Severity: HIGH — Fixed in: 4.17.21
```

**成因、觸發條件與可能影響**

專案鎖定舊版 `lodash`，已知存在 Prototype Pollution 弱點；若應用程式對來自使用者輸入的物件使用 `lodash` 的合併類函式（如 `merge`/`mergeWith`），可能遭污染原型鏈進而影響應用邏輯或導致阻斷服務。已人工確認 `src/orders/utils.js` 中 `merge()` 確實用於處理前端傳入的篩選條件物件，具備實際可觸發路徑。

**對應依據**

- 規範／標準：OWASP Top 10:2025 A03 Software Supply Chain Failures
- CWE：CWE-1321（Improperly Controlled Modification of Object Prototype Attributes, 'Prototype Pollution'）

**建議修正方式**

升級至 `lodash@4.17.21` 以上版本。

```diff
-  "lodash": "4.17.15"
+  "lodash": "^4.17.21"
```

**修正資訊**

- 優先順序：2
- 負責人：`陳大文`
- 狀態：待處理
- 預計完成時間：`2026-10-14`

**驗證方式與結果**

- 重跑分析／工具：待升級後重跑 Trivy，確認該弱點不再出現
- 新增／更新回歸測試：不適用（第三方套件升級，以既有測試套件覆蓋回歸風險）
- 既有測試套件：尚未重跑
- 殘餘風險：（待修正後評估）

---

### F3 - 訂單列表查詢疑似 N+1 Query

- **類型**：效能與資源管理問題
- **確認層級**：疑似
- **嚴重度**：MEDIUM（未評 CVSS，依本專案 Bug/效能嚴重度慣例暫定；待確認後補）
- **位置**：`src/orders/service.py`　類別／方法：`list_orders_with_items`　行號：`30-38`

**證據／可重現程式碼片段**

```python
orders = Order.query.filter_by(user_id=user_id).all()
for order in orders:
    order.items = OrderItem.query.filter_by(order_id=order.id).all()  # 疑似每筆訂單各一次查詢
```

**成因、觸發條件與可能影響**

迴圈內對每筆訂單各別查詢 `OrderItem`，訂單數量大時可能造成大量資料庫往返。尚未取得實際 production 流量下的訂單數量分布，無法確認是否達到有感效能影響，暫列為疑似，待確認待辦事項：請維運團隊提供目前單一使用者平均/尖峰訂單筆數。

**對應依據**

- 規範／標準：（無直接對應正式標準，屬效能工程業界慣例）
- CWE：CWE-1050（Excessive Platform Resource Consumption within a Loop，近似對應）

**建議修正方式**

改用 join 或批次查詢一次取回所有相關 `OrderItem`。

```diff
-  orders = Order.query.filter_by(user_id=user_id).all()
-  for order in orders:
-      order.items = OrderItem.query.filter_by(order_id=order.id).all()
+  orders = (
+      Order.query.filter_by(user_id=user_id)
+      .options(joinedload(Order.items))
+      .all()
+  )
```

**修正資訊**

- 優先順序：3（待確認觸發規模後可能調整）
- 負責人：`待指派`
- 狀態：待處理
- 預計完成時間：`待確認後排定`

**驗證方式與結果**

- 重跑分析／工具：（待確認後決定是否需要效能基準測試）
- 新增／更新回歸測試：（待確認）
- 既有測試套件：（待確認）
- 殘餘風險：（待確認）

---

### S1 - `list_orders_with_items` 函式職責過多，建議拆分

- **類型**：程式碼品質問題
- **確認層級**：建議
- **嚴重度**：LOW（本專案品質慣例）
- **位置**：`src/orders/service.py`　類別／方法：`list_orders_with_items`　行號：`30-58`

**證據／可重現程式碼片段**

```python
def list_orders_with_items(user_id):
    # 28 行：查詢、格式轉換、金額計算、排序全部混在同一函式
    ...
```

**成因、觸發條件與可能影響**

函式同時負責查詢、資料轉換、金額計算與排序，提升了修改時影響範圍與測試難度；不影響目前功能正確性。

**對應依據**

- 規範／標準：（業界慣例：單一職責原則）
- CWE：不適用（非弱點分類）

**建議修正方式**

拆分為 `fetch_orders()`、`calculate_totals()`、`sort_orders()` 三個函式，各自可獨立測試。

```diff
（建議重構方向，非必要修正，可於後續迭代處理）
```

**修正資訊**

- 優先順序：4
- 負責人：`待排入技術債 backlog`
- 狀態：待處理
- 預計完成時間：`未排定`

**驗證方式與結果**

- 重跑分析／工具：不適用
- 新增／更新回歸測試：不適用
- 既有測試套件：不適用
- 殘餘風險：無（屬改善建議，非缺陷）

---

## 未涵蓋範圍與限制

- 本次為 PR diff 分析，未重新掃描 `src/orders/` 以外的既有程式碼。
- DAST（OWASP ZAP）未執行，因本 PR 未部署至可測試的 staging 環境；建議下次 release 前補跑。
- 資料庫 migration 腳本與前端 UI 元件不在本次分析範圍內。

## Next Actions

1. 修復 F1（SQL Injection）後再合併，優先順序最高。
2. 修復 F2（lodash 升級）可與 F1 同批次處理。
3. 向維運團隊確認訂單筆數分布，以判斷 F3 是否需要立即處理。
4. S1 排入技術債 backlog，非合併阻斷項目。
5. Release 前補跑 OWASP ZAP 對 staging 環境進行 DAST 掃描。

---

是否要我針對前 **2** 項問題（F1、F2）提出具體修復編輯建議？（不會自動寫入檔案，待確認後才動手修改）
