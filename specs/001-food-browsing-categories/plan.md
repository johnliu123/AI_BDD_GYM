# 系統分析規劃

## 輸入

- 規格： [spec.md](./spec.md)
- 技術研究： [research.md](./research.md)
- 技術堆疊： [techstack.md](./techstack.md)

## 專案結構

### 文件（本功能）

```text
specs/001-food-browsing-categories/
├── spec.md
├── research.md
├── techstack.md
├── plan.md
├── ui-plan.md
├── prototype/
├── data-model.dbml
├── http-api.yaml
└── tasks.md
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── src/
├── public/
├── package.json
└── vite.config.*

backend/
├── src/
├── package.json
├── migrations/
└── tests/
```

**結構決策**：採用最小可行的前後端分離結構。前端維持單頁應用，僅負責餐點瀏覽與分類展示；後端提供讀取餐點與分類資料的 REST API；資料以關聯式資料表儲存，避免將本次功能擴張到購物車、訂單與管理後台。

## 設計決策

- 本迭代只處理顧客瀏覽餐點與分類，不納入購物車、訂單、付款、管理端或其他後續迭代功能。
- 前端以 React + TypeScript + Vite 建置，使用資料驅動渲染方式呈現餐點清單與分類。
- 後端以 REST JSON API 提供餐點與分類資料，讓前端只讀取結構化資料，且避免資料與渲染邏輯混在一起。
- 資料模型使用 `categories` 與 `menu_items` 的關聯式表格，`menu_items.category_id` 對應 `categories.id`，以維持餐點與分類的一致性。
- 圖片與價格的值由後端資料來源提供，前端不自行拼接價格或覆寫資料；若缺少圖片或價格，則顯示佔位與空值提示，而非假資料。
- 本階段不在設計中加入資料寫入與訂單計算權限；只處理已確認的讀取與展示需求。

## 分析流程規劃

本段只規劃後續系統分析的範圍與排程，不在此處產生各端點的分析結論或設計細節。先從使用者需求拆出需求部位，再標記每個需求部位涉及的技術端點；以需求間的先後依賴決定 Wave。每個端點至少安排一個分析步驟；只有前置分析結果不會阻礙其工作的端點，才排在同一 Wave 平行處理。

### 餐點瀏覽與分類：需求部位與端點盤點

| 需求部位 | 涉及的技術端點 |
|---|---|
| 顧客瀏覽餐點清單，查看名稱、圖片、價格及分類 | 前端、後端 API、關聯式資料庫 |
| 依據餐點資料正確顯示每筆餐點對應的分類 | 前端、後端 API、關聯式資料庫 |
| 缺少資料時保持頁面穩定且不誤導顧客 | 前端、後端 API |
| 依規格維持餐點與分類資料的一致性 | 關聯式資料庫、後端 API |

本次實際端點為 前端、後端 API、關聯式資料庫；需求未包含 金流、檔案儲存、店家管理、購物車、訂單、付款與第三方服務，因此不將它們列入本次計畫。

### 餐點瀏覽與分類：分析 Wave 排程

Wave 的切分依分析工作對其他端點結果的需求，而非單純按端點清單排序。每個端點安排獨立分析步驟；同一 Wave 中沒有相依阻礙的端點分析可平行委派。

#### Wave 1：先定義前端互動與資料模型

以下端點分析可平行進行，作為後續 API 分析的輸入：

1. **前端分析（/ui-plan）**
   - 端點：前端 UI
   - 輸出產物：`specs/001-food-browsing-categories/ui-plan.md`、`specs/001-food-browsing-categories/prototype/`
   - 前置 Wave：無
   - 分析邊界：只處理餐點瀏覽頁面與餐點分類展示，不包含購物車、訂單或後台管理。

2. **資料模型分析（/data-plan）**
   - 端點：關聯式資料庫（`categories`、`menu_items`）
   - 輸出產物：`specs/001-food-browsing-categories/data-model.dbml`
   - 前置 Wave：無
   - 分析邊界：只分析餐點與分類的關聯結構、必要欄位與資料一致性，不設計訂單或支付資料模型。

#### Wave 2：依前置結果設計 API 契約

1. **API 分析（/api-plan）**
   - 端點：後端 REST API
   - 輸出產物：`specs/001-food-browsing-categories/http-api.yaml`
   - 前置 Wave：Wave 1 的 `ui-plan.md`、`prototype/`、`data-model.dbml`
   - 分析邊界：只分析餐點列表與分類資料的讀取 API，不包含寫入、訂單、付款、登入或管理 API。

## 委派摘要

| Wave | Skill id | 端點 | 輸出產物 | 前置結果 |
|---|---|---|---|---|
| Wave 1 | `/ui-plan` | 前端 UI | `specs/001-food-browsing-categories/ui-plan.md`、`specs/001-food-browsing-categories/prototype/` | 無 |
| Wave 1 | `/data-plan` | 關聯式資料庫 | `specs/001-food-browsing-categories/data-model.dbml` | 無 |
| Wave 2 | `/api-plan` | 後端 REST API | `specs/001-food-browsing-categories/http-api.yaml` | Wave 1 的 UI 設計與資料模型 |

## 交付前確認

- [ ] Wave 1 之 UI 與資料模型先行完成，才能開始 API 設計
- [ ] 本計畫僅涵蓋指定的 01 迭代範圍，不擴大至購物車、訂單與店家管理
- [ ] 產物與規格、研究結果保持一致，未引入未澄清的新增需求
- [ ] 後續端點分析產物須依各自 skill 的法規與 `CONSTITUTION.md` 進行自檢

Constitution self-check: pass
