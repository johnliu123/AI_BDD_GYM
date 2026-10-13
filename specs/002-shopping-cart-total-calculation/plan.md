# 系統分析規劃：點餐系統第二迭代－購物車與金額計算

## 輸入

- 規格：[spec.md](./spec.md)
- 技術研究：[research.md](./research.md)
- 技術堆疊：[techstack.md](./techstack.md)

## 專案結構

### 文件（本功能）

```text
specs/002-shopping-cart-total-calculation/
├── spec.md
├── research.md
├── techstack.md
├── plan.md
├── ui-plan.md
├── prototype/
├── data-model.dbml
└── contracts/
    └── http-api.yaml
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   └── menuApi.js
├── package.json
└── vite.config.js

backend/
├── src/
│   ├── config/
│   ├── data/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── __tests__/
│   └── server.js
└── package.json
```

**結構決策**：沿用現有 `frontend/` React + Vite 與 `backend/` Express 專案；02 的規格、研究與端點分析產物獨立放在 `specs/002-shopping-cart-total-calculation/`。目前菜單資料來源與 `GET /menu-items` 尚無規格群組／選項欄位；本迭代擴充既有菜單來源及讀取 API，不另建菜單服務。系統沒有既有認證能力；本迭代不建置登入，購物車依伺服器簽發的訪客工作階段 cookie 隔離。資料庫 driver 與 session middleware/store 尚未安裝，不得視為已建置能力。資料模型沿用研究文件根據第一迭代 DBML 選定的 PostgreSQL；重複加入固定建立獨立項目，金額精度沿用菜單來源並由 T002 核實。

## 設計決策

- 前端與 API 延續現有 React + JavaScript + Vite、Node.js LTS + Express、REST JSON 方向；購物車 API 契約由 API Plan 產物定義，菜單規格資料則擴充既有 `GET /menu-items`。依據：[research.md](./research.md)「前端與 API 延續」。
- 菜單規格資料沿用既有菜單 API 與資料來源，不新增服務：`GET /menu-items` 須回傳餐點供應狀態、目前價格、規格群組，以及各群組的選項識別、名稱、目前加價與有效狀態；沒有群組時回傳空陣列。金額以精確十進位字串傳輸。T003 須完成來源擴充及 API 驗收；菜單資料模型與 API 契約同步更新於第一迭代文件。
- 購物車以伺服器簽發且由 Express session middleware 驗證的 `req.sessionID` 作為訪客工作階段歸屬依據；一個工作階段一個購物車，不提供登入帳號綁定或跨裝置／瀏覽器同步。不得接受客戶端自報工作階段 ID 或其他身份欄位。Session **idle 24 小時、absolute 7 天**（spec Q10）；失效後 API 對使用者為新空購物車，舊 cart 列定期清理（spec Q11、tasks T024、T025）。依據：[spec.md](./spec.md) FR-004、Q9、Q10、Q11 與 [research.md](./research.md)「訪客工作階段與購物車歸屬」。
- 端點分析須涵蓋 guest session 的建立、伺服器端驗證、PostgreSQL session store、cookie 屬性、逾期與失效處理，以及狀態變更請求的精確 Origin／CSRF 防護；session 套件仍是 research 建議，須於分析中核實相容性，不得描述為已安裝。
- 本迭代限購物車與餐點金額計算，不納入訂單建立、付款、訂單查詢或店家管理；相關行為不得列入本計畫端點。

### 設計決策·PostgreSQL

- PostgreSQL 關聯式購物車資料沿用第一迭代 DBML 的資料庫決策；餐點具有規格群組時，每個群組必須且只能對應一個有效選項；相同餐點／規格每次有效加入建立獨立項目。新增購物車項目及其所選規格若涉及多筆寫入，需納入研究所述資料庫交易邊界。依據：[spec.md](./spec.md) FR-002、BR-002、Q7 及 [research.md](./research.md)「關聯式購物車資料與交易」。

### 設計決策·伺服器權威計價

- 餐點供應狀態與最新餐點／規格價格由後端驗證與讀取；客戶端提供的金額不得成為計價依據。餐點或所選規格加入後失效時，保留購物車項目並標示不可用，不提供金額或納入總額；拒絕改數量但允許刪除。API 金額固定以十進位字串表示。T002 須確認菜單來源的幣別、precision／scale 與欄位映射；未完成前不得實作計價，且不得以 JavaScript `Number` 作為計價依據。計畫中的資料／API 分析需維持 FR-003、FR-005、FR-008 與 BR-001。

## 分析流程規劃

本段只規劃後續系統分析的範圍與排程，不在此處產生各端點的分析結論或設計細節。先從規格需求拆出需求部位，再標記涉及的技術端點；Wave 依分析工作所需的前置輸入排序。每個端點至少安排一項分析工作，後續 API 分析須取得 UI 流程與資料模型結果。

### 端點盤點

本節為購物車與金額計算之需求部位與端點對照（tasks 錨點 `plan:端點盤點`）。

| 需求部位 | 涉及的技術端點 |
|---|---|
| 取得規格群組／選項並選擇餐點規格（FR-002、BR-002） | 前端 UI、既有菜單 API、PostgreSQL |
| 選擇餐點規格並將供應中餐點加入工作階段購物車（FR-001、FR-002、FR-003、BR-002） | 前端 UI、既有菜單 API、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護 |
| 依訪客工作階段隔離購物車讀寫（FR-004） | 購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護 |
| 顯示購物車項目、修改數量及刪除項目（FR-006、FR-007、BR-003） | 前端 UI、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護 |
| 餐點或規格加入後失效時保留不可用項目，禁止改數量但允許刪除（FR-008、SC-005） | 前端 UI、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護 |
| 使用最新價格並重新計算項目與總金額，不採信前端金額（FR-005、FR-006、FR-007、BR-001） | 前端 UI、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護 |
| 空購物車、價格更新、錯誤操作與跨工作階段隔離驗收（SC-001 至 SC-005） | 前端 UI、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護 |

本次實際端點為 **前端 UI、既有菜單 API、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護**；菜單資料擴充沿用既有服務，不新增服務。訪客工作階段是匿名 session，不是認證或登入。需求未包含金流、訂單服務、付款、店家管理、檔案儲存或第三方服務新建置，因此不將這些列入本迭代計畫。

### 購物車與金額計算：分析 Wave 排程

#### Wave 1：平行分析 UI 操作流程與購物車／訪客工作階段資料模型

兩項工作分別處理 UI 與資料端點，互不依賴對方分析結果；成果共同作為 API 契約分析的前置輸入。

1. **前端 UI 分析（Skill：`/ui-plan`）**
   - 端點：購物車操作介面與使用者流程。
   - 輸出產物：`specs/002-shopping-cart-total-calculation/ui-plan.md`、`specs/002-shopping-cart-total-calculation/prototype/`。
   - 前置結果：無；輸入規格、計畫、研究與技術堆疊。
   - 分析邊界：涵蓋加入餐點、為每個規格群組各選一項、檢視購物車、修改數量、刪除、空狀態及價格更新顯示；若任一群組未選，加入操作須被拒絕。使用假資料製作流程雛形。不設計 API 或資料表，不加入結帳與訂單流程。相同餐點／規格重複加入時新增獨立項目。

2. **資料模型分析（Skill：`/data-plan`）**
   - 端點：PostgreSQL 關聯式持久化，含 guest session、session store 與購物車歸屬關聯。
   - 輸出產物：`specs/002-shopping-cart-total-calculation/data-model.dbml`。
   - 前置結果：無；輸入規格、計畫、研究與技術堆疊。
   - 分析邊界：涵蓋訪客工作階段識別的 server-side persistence、每個工作階段一車、session/cart 關係、餐點與規格選項關聯、每個規格群組恰有一個已選選項、可用狀態、數量、外鍵及交易邊界；不設計 HTTP 路由、cookie 傳輸或 UI。每次有效新增均建立獨立項目，不設餐點／規格組合唯一限制；金額精度沿用菜單來源並保留精度映射待核對註記。

#### Wave 2：整合 UI 與資料結果分析 API／訪客工作階段介面

1. **購物車 API 與訪客工作階段整合分析（Skill：`/api-plan`）**
   - 端點：Express REST API、伺服器簽發的 guest session cookie、精確 Origin／CSRF request protection。
   - 輸出產物：`specs/002-shopping-cart-total-calculation/contracts/http-api.yaml`。
   - 前置結果：Wave 1 的 `ui-plan.md`、`prototype/` 與 `data-model.dbml`；以及第一迭代既有 `GET /menu-items` 菜單資料契約。
   - 分析邊界：依 UI 流程及資料模型定義購物車讀取、新增、修改、刪除的 API 契約，明列依賴既有 `GET /menu-items` 擴充後的規格群組／選項資料，以及訪客 session 的建立／續用／失效、cart ownership 與 CSRF／Origin 錯誤。每個購物車請求須以 middleware 驗證後的 `req.sessionID` 定位工作階段購物車，不定義或採用登入身份；分析供應狀態、計價、每個規格群組恰選一項、輸入驗證及錯誤契約。API 金額固定以十進位字串傳輸，幣別／精度依 T002 核對。不採納客戶端價格，不設計訂單、付款或管理 API。

## 委派摘要

| Wave | Skill id | 端點／分析範圍 | 輸出產物 | 前置結果 |
|---|---|---|---|---|
| Wave 1 | `/ui-plan` | 購物車 UI、操作流程及可操作雛形 | `specs/002-shopping-cart-total-calculation/ui-plan.md`、`specs/002-shopping-cart-total-calculation/prototype/` | 無 |
| Wave 1 | `/data-plan` | PostgreSQL 訪客工作階段、購物車與規格資料模型 | `specs/002-shopping-cart-total-calculation/data-model.dbml` | 無 |
| Wave 2 | `/api-plan` | Express 購物車 API、訪客工作階段 cookie 與 CSRF／Origin 整合邊界 | `specs/002-shopping-cart-total-calculation/contracts/http-api.yaml` | Wave 1 UI Plan、prototype、guest session／cart data-model；第一迭代菜單 API 契約 |

## 交付前確認

- Wave 1 的 UI 與資料模型工作可平行執行；Wave 2 API 分析須等待並引用 Wave 1 全部產物。
- 每個需求部位均對應至少一個分析端點，且各端點都已列入具體 Wave 工作。
- 系統分析文件不新增 spec 未定義的 FR/NFR/BR；需求追溯只引用 FR-001 至 FR-008、BR-001 至 BR-003、SC-001 至 SC-005 及 User Story 1、2。
- 菜單 API／資料來源擴充及多群組、無群組、停用選項與十進位字串驗收已列入 T003；T002 菜單幣別／精度仍是計價實作前置。訪客工作階段已依 Q9 定案；timeout 與 cart 清理依 spec Q10、Q11，由 `contracts/http-api.yaml`、`techstack.md` 與 tasks T001、T024、T025 落地。重複加入政策及十進位字串表示已定案，不得再標為待確認。
- 本計畫不涵蓋訂單建立、付款、訂單狀態或店家管理。

Constitution self-check: pass
