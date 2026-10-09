# 機器錨點 → READ 範圍

Implement 執行任務前，依 `tasks.md` 行尾 `←` 與小節 **必讀對照** 的 **機器錨點** 欄，只 READ 對應文件中的對應部位。不得因錨點而重新讀整份文件（除非該文件極短且無更細錨點）。

## 語法

- 多個錨點以 `;` 分隔（前後空白可忽略）。
- 前綴不區分大小寫：`openapi:` 與 `OpenAPI:` 同義。

## 對照表

| 前綴 | 範例 | READ 範圍 |
|---|---|---|
| `spec:` | `spec:US1` | `spec.md` 中標題含 User Story 1 的整段（至下一同級 User Story 前） |
| `spec:` | `spec:FR-001` | `spec.md` 中 ID 為 FR-001 的條目及其直接驗收引用 |
| `spec:` | `spec:US1·情境2` | 該 User Story 下第 2 條驗收情境 |
| `plan:` | `plan:structure` | `plan.md` 的「專案結構」樹與結構決策 |
| `plan:` | `plan:design-decisions` | `plan.md` 的「設計決策」列表 |
| `plan:` | `plan:端點盤點` | `plan.md` 需求部位與端點對照、Wave（若存在） |
| `techstack:` | `techstack:backend` | `techstack.md` 中 backend／伺服器相關列 |
| `techstack:` | `techstack:frontend` | `techstack.md` 中 frontend 相關列 |
| `openapi:` | `openapi:importPhoto` | `contracts/http-api.yaml` 中 `operationId: importPhoto` 的 path item（parameters、requestBody、responses、x-errorCases） |
| `openapi:` | `openapi:GET /albums` | 該 path + method 的 operation（若無 operationId，以 path+method 定位） |
| `openapi:` | `openapi:components.schemas.ErrorBody` | components.schemas.ErrorBody |
| `dbml:` | `dbml:Table photos` | `data-model.dbml` 中 `Table photos { ... }` 區塊 |
| `dbml:` | `dbml:Note:MySQL` | Project Note 或註解中 `=== Endpoint: MySQL ===` 至下一 Endpoint 前 |
| `dbml:` | `dbml:Note:私有檔案儲存` | 同上，私有檔案儲存小節 |
| `dbml:` | `dbml:Project` | `Project { ... Note: ... }` 全文（僅當錨點別無更細表／Note 時） |
| `ui-plan:` | `ui-plan:§實作` | `ui-plan.md` 二級標題「## 實作」整節 |
| `ui-plan:` | `ui-plan:§畫面與流程→匯入照片` | 「## 畫面與流程」內「匯入」相關小節（### 或列表項標題匹配） |
| `prototype:` | `prototype:index.html` | `prototype/index.html` 與其引用的 `assets/*`（UI 對照，非複製說明文字） |
| `quickstart:` | `quickstart:full` | `quickstart.md` 全文（僅 Polish／smoke 任務） |
| `research:` | `research:照片持久化` | `research.md`「決策摘要」下 `### 照片持久化` 整節（至下一 `###` 前） |

## 解析失敗

- 錨點在文件中找不到對應部位：**STOP**，回報 `tasks.md` 的 T 編號、錨點、文件路徑；建議更新分析產物或 `/tasks` 修正 Binding，或 `/clarify`。
- 文件不存在：同 STOP；若為 optional（tasks 未列於必讀對照），不得臆測內容。

## 與必讀對照表的關係

1. 進入 `####` 小節：先 READ 該小節 **必讀對照** 每一列的 **機器錨點**（可合併同文件多次 READ 為一次，但須覆蓋每一列）。
2. 執行單一 `Tnnn`：再 READ 該行 `←` 所列錨點（若已於小節閘門讀過相同錨點，可引用已載入上下文，但須能指出對應段落）。
