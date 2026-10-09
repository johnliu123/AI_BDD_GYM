# Tasks: 相簿整理器

**Input**: 設計文件位於 `specs/001-photo-album-organizer/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 需求、User Story、驗收 |
| `research.md` | 技術決策與理由 |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | 技術棧與版本（Setup） |
| `ui-plan.md` · `prototype/` | 前端 |
| `data-model.dbml` | MySQL 與私有檔案儲存 |
| `contracts/http-api.yaml` | API 契約 |
| `quickstart.md` | 建置與 smoke |

**Organization**: User Story 內 **#### 前端／後端**；每小節 **必讀對照** → 任務；每 `Tnnn` 行尾 **`←` 機器錨點**；對照表每列至少一個任務引用。

**機器錨點語法**：`spec:US1` · `research:前端與 API` · `research:照片持久化` · `research:格式、驗證與預覽` · `research:拍攝日期` · `research:相簿順序與 API` · `openapi:importPhoto` · `dbml:Table photos` · `ui-plan:§…` · `prototype:…`

## Phase 1: Setup

**Purpose**: 建立前後端專案骨架、套件腳本與安全的本機設定範本。

**Read when executing this phase**: `research.md`（決策摘要）、`techstack.md`、`plan.md`（僅本 Phase）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 決策摘要 → 前端與 API | `research:前端與 API` | Vite 原生前端、Express、dev 代理 |
| `techstack.md` | Backend／Frontend 依賴與版本表 | `techstack:backend`; `techstack:frontend` | Express、Vite、mysql2、Sharp 等版本 |
| `plan.md` | 專案結構樹、設計決策（Origin、`data/`） | `plan:structure`; `plan:design-decisions` | 目錄布局、gitignore、env 變數 |

- [ ] T001 [P] 建立 `backend/package.json` 與啟動／測試腳本 ← `research:前端與 API`; `techstack:backend`; `plan:structure`
- [ ] T002 [P] 建立 `frontend/package.json`、`index.html`、`vite.config.js` ← `research:前端與 API`; `techstack:frontend`; `plan:structure`
- [ ] T003 建立 `.gitignore`、`backend/.env.example` ← `plan:design-decisions`; `plan:structure`

---

## Phase 2: Foundational

**Purpose**: 共用 schema、DB 連線、API 啟動、錯誤與 Origin 驗證。

**⚠️ 所有使用者故事都依賴此階段完成。**

**Read when executing this phase**: `research.md`（決策摘要）、`data-model.dbml`、`contracts/http-api.yaml`（共通 schema）、`plan.md`（設計決策）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 決策摘要 → 照片持久化 | `research:照片持久化` | MySQL 中繼 vs 私有檔案目錄 |
| `data-model.dbml` | `Table albums`、`photos`、`album_photos`；索引與不變量 | `dbml:Table albums`; `dbml:Table photos`; `dbml:Table album_photos` | migration 欄位與唯一索引 |
| `data-model.dbml` | `Project Note` → MySQL transaction／重排 | `dbml:Note:MySQL` | 後續 US 持久化前提 |
| `contracts/http-api.yaml` | `components.schemas.ErrorBody`、共通 Origin 說明 | `openapi:components.schemas.ErrorBody`; `plan:design-decisions` | middleware 錯誤格式與 Origin |
| `plan.md` | 設計決策：loopback、精確 Origin | `plan:design-decisions` | server 綁定與 guard |

- [ ] T004 建立 `backend/migrations/001_initial_schema.sql` ← `research:照片持久化`; `dbml:Table albums`; `dbml:Table photos`; `dbml:Table album_photos`
- [ ] T005 建立 `backend/src/db/pool.js`、`config.js` ← `research:照片持久化`; `dbml:Table albums`; `plan:structure`
- [ ] T006 [P] 建立 `error-handler.js`、`origin-guard.js` ← `openapi:components.schemas.ErrorBody`; `plan:design-decisions`
- [ ] T007 建立 `app.js`、`server.js` ← `plan:design-decisions`; `openapi:components.schemas.ErrorBody`
- [ ] T008 [P] 建立 `backend/test/helpers/test-database.js` ← `dbml:Note:MySQL`; `plan:structure`

**Checkpoint**: schema、DB、API 安全基礎就緒。

---

## Phase 3: User Story 1 - 建立日期分組的相簿 (Priority: P1) 🎯 MVP

**Goal**: 上傳後依拍攝日期分組；可查詢相簿與照片；缺日期入 `unknown`。

**Independent Test**: 多日期 + 一張無日期；API 查詢各歸正確相簿。

**端點（對齊 plan.md）**: 前端、後端 API、MySQL、私有檔案儲存

### Tests for User Story 1

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、驗收情境 1–3 | `spec:US1`; `spec:US1·情境1` | 日期分組與 unknown |
| `ui-plan.md` | §畫面與流程 → 匯入照片、瀏覽相簿 | `ui-plan:§畫面與流程→匯入照片`; `ui-plan:§畫面與流程→瀏覽相簿` | 流程驗收 |
| `prototype/` | `index.html` 列表、`album.html` 格狀 | `prototype:index.html`; `prototype:album.html` | 可見 UI 對照 |

- [ ] T037 [US1] 依 ui-plan／prototype 走查 US1 匯入與列表（記錄於 `specs/…/us1-ui-verify.md` 或 issue） ← `spec:US1`; `ui-plan:§畫面與流程→匯入照片`; `prototype:index.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、FR-001、FR-002 | `spec:US1`; `spec:FR-001`; `spec:FR-002` | 日期分組規則 |
| `research.md` | 決策摘要 → 拍攝日期 | `research:拍攝日期` | EXIF 優先序、unknown 相簿 |
| `research.md` | 決策摘要 → 格式、驗證與預覽 | `research:格式、驗證與預覽` | 白名單、20 MiB、Sharp 驗證 |
| `contracts/http-api.yaml` | `POST /photos/import` · `importPhoto` | `openapi:importPhoto` | 匯入契約、201／400／413 |
| `contracts/http-api.yaml` | `GET /albums` · `listAlbums`；`GET …/photos` · `listAlbumPhotos` | `openapi:listAlbums`; `openapi:listAlbumPhotos` | 列表契約 |
| `data-model.dbml` | `Table photos` 之 `captured_at`；unknown 相簿 | `dbml:Table photos`; `dbml:Table albums` | EXIF 與 date_key |
| `data-model.dbml` | `Project Note` → 私有檔案、`tmp/` 生命週期 | `dbml:Note:私有檔案儲存`; `dbml:Note:MySQL` | 匯入 transaction |

- [ ] T009 [P] [US1] `backend/test/unit/capture-date.test.js` ← `research:拍攝日期`; `spec:FR-001`; `dbml:Table photos`
- [ ] T010 [P] [US1] `backend/test/contract/photo-import.test.js` ← `research:格式、驗證與預覽`; `openapi:importPhoto`; `openapi:listAlbums`; `openapi:listAlbumPhotos`; `spec:US1`

### Implementation for User Story 1

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `ui-plan.md` | §實作 · 雛形技術；§驗證 · 雛形 | `ui-plan:§實作`; `ui-plan:§驗證` | fetch／FormData 與狀態 |
| `ui-plan.md` | §畫面與流程 → 匯入、列表 | `ui-plan:§畫面與流程→匯入照片`; `ui-plan:§畫面與流程→瀏覽相簿` | 畫面區塊 |
| `prototype/index.html`、`album.html` | 列表、匯入、格狀 | `prototype:index.html`; `prototype:album.html` | 版面與互動粒度 |
| `contracts/http-api.yaml` | `importPhoto`、`listAlbums`、`listAlbumPhotos` 回應欄位 | `openapi:importPhoto`; `openapi:listAlbums`; `openapi:listAlbumPhotos` | 前端呼叫契約 |

- [ ] T018 [US1] `frontend/index.html` ← `ui-plan:§畫面與流程→瀏覽相簿`; `prototype:index.html`
- [ ] T019 [US1] `frontend/src/main.js` 逐檔上傳與列表 ← `openapi:importPhoto`; `openapi:listAlbums`; `openapi:listAlbumPhotos`; `ui-plan:§畫面與流程→匯入照片`
- [ ] T020 [P] [US1] `frontend/src/styles.css` ← `ui-plan:§實作`; `prototype:index.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | FR-001、FR-002、FR-010 | `spec:FR-001`; `spec:FR-002`; `spec:FR-010` | 分組與匯入 |
| `plan.md` | 設計決策：每請求一檔、transaction | `plan:design-decisions` | 匯入語意 |
| `data-model.dbml` | `Table albums`、`photos`、`album_photos`；匯入 Note | `dbml:Table albums`; `dbml:Table photos`; `dbml:Table album_photos`; `dbml:Note:MySQL` | repository／transaction |
| `research.md` | 照片持久化、格式驗證 | `research:照片持久化`; `research:格式、驗證與預覽` | 儲存 layout、Sharp、413 |
| `data-model.dbml` | 私有目錄 layout | `dbml:Note:私有檔案儲存` | photo-storage |
| `contracts/http-api.yaml` | `importPhoto`、`listAlbums`、`listAlbumPhotos` | `openapi:importPhoto`; `openapi:listAlbums`; `openapi:listAlbumPhotos` | routes 與狀態碼 |

- [ ] T011 [P] [US1] `backend/src/services/capture-date.js` ← `research:拍攝日期`; `spec:FR-001`; `dbml:Table photos`
- [ ] T012 [P] [US1] `backend/src/services/photo-storage.js` ← `research:照片持久化`; `dbml:Note:私有檔案儲存`; `plan:design-decisions`
- [ ] T013 [US1] `backend/src/services/image-service.js` ← `research:格式、驗證與預覽`; `spec:FR-001`; `plan:design-decisions`
- [ ] T014 [US1] `album-repository.js`、`photo-repository.js` ← `dbml:Table albums`; `dbml:Table album_photos`; `dbml:Table photos`
- [ ] T015 [US1] `photo-service.js` 匯入 transaction ← `dbml:Note:MySQL`; `plan:design-decisions`; `openapi:importPhoto`
- [ ] T016 [US1] `routes/albums.js`、`routes/photos.js` ← `openapi:importPhoto`; `openapi:listAlbums`; `openapi:listAlbumPhotos`
- [ ] T017 [US1] 註冊路由並跑 T010 ← `openapi:importPhoto`; `openapi:listAlbums`; `openapi:listAlbumPhotos`

**Checkpoint**: MVP 可上傳、分組、列表。

---

## Phase 4: User Story 2 - 以拖放方式重新排列照片 (Priority: P2)

**Goal**: 同相簿拖放排序並持久化；無效操作不變更。

**Independent Test**: 排序後重載一致；跨相簿／取消無變更。

**端點（對齊 plan.md）**: 前端、後端 API、MySQL

### Tests for User Story 2

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 2、驗收情境 1–3 | `spec:US2`; `spec:US2·情境3` | 取消／無效放置 |
| `ui-plan.md` | §畫面與流程 → 排序；§互動（拖放模擬） | `ui-plan:§畫面與流程→排序` | DnD 或等價 UX |
| `prototype/album.html` | 點兩張交換順序 | `prototype:album.html` | 流程級模擬 |

- [ ] T038 [US2] 走查 US2 排序 UX（ui-plan／prototype） ← `spec:US2`; `ui-plan:§畫面與流程→排序`; `prototype:album.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 2 | `spec:US2` | 排序持久化 |
| `research.md` | 決策摘要 → 相簿順序與 API | `research:相簿順序與 API` | 完整 ID 清單 reorder |
| `contracts/http-api.yaml` | `PUT …/photo-order` · `updateAlbumPhotoOrder` | `openapi:updateAlbumPhotoOrder` | 400／409／200 |
| `data-model.dbml` | `album_photos.position`；重排 transaction Note | `dbml:Table album_photos`; `dbml:Note:MySQL` | 0..n-1 不變量 |

- [ ] T021 [P] [US2] `backend/test/contract/photo-order.test.js` ← `research:相簿順序與 API`; `openapi:updateAlbumPhotoOrder`; `spec:US2`; `dbml:Table album_photos`

### Implementation for User Story 2

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `ui-plan.md` | §畫面與流程 → 排序 | `ui-plan:§畫面與流程→排序` | 拖放／還原 |
| `prototype/album.html` | 排序模式提示 | `prototype:album.html` | 互動 |
| `contracts/http-api.yaml` | `updateAlbumPhotoOrder` | `openapi:updateAlbumPhotoOrder` | PUT body `photo_ids` |

- [ ] T025 [US2] `frontend/src/main.js` DnD 與 API ← `openapi:updateAlbumPhotoOrder`; `ui-plan:§畫面與流程→排序`
- [ ] T026 [P] [US2] `frontend/src/styles.css` 拖曳狀態 ← `ui-plan:§畫面與流程→排序`; `prototype:album.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 相簿順序與 API | `research:相簿順序與 API` | 同相簿、手動後 append |
| `contracts/http-api.yaml` | `updateAlbumPhotoOrder` | `openapi:updateAlbumPhotoOrder` | 路由與錯誤 |
| `data-model.dbml` | 重排 transaction | `dbml:Note:MySQL`; `dbml:Table album_photos` | position 更新 |

- [ ] T022 [US2] `photo-repository.js` 排序 transaction ← `research:相簿順序與 API`; `dbml:Note:MySQL`; `dbml:Table album_photos`
- [ ] T023 [US2] `photo-service.js` 排序驗證 ← `research:相簿順序與 API`; `openapi:updateAlbumPhotoOrder`; `spec:US2`
- [ ] T024 [US2] `routes/albums.js` 排序端點 ← `research:相簿順序與 API`; `openapi:updateAlbumPhotoOrder`

**Checkpoint**: 排序一致且可重載。

---

## Phase 5: User Story 3 - 以平鋪式預覽瀏覽相片 (Priority: P3)

**Goal**: 格狀縮圖、preview API、空狀態。

**Independent Test**: preview 回 webp；空相簿可辨識。

**端點（對齊 plan.md）**: 前端、後端 API、私有檔案儲存

### Tests for User Story 3

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 3 | `spec:US3` | 平鋪預覽 |
| `ui-plan.md` | §畫面與流程 → 瀏覽；空狀態 | `ui-plan:§畫面與流程→瀏覽相簿` | 格狀／空狀態 |

- [ ] T039 [US3] 走查 US3 格狀與空狀態 ← `spec:US3`; `ui-plan:§畫面與流程→瀏覽相簿`; `prototype:album.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 格式、驗證與預覽 | `research:格式、驗證與預覽` | WebP 預覽、無 EXIF |
| `contracts/http-api.yaml` | `GET …/preview` · `getPhotoPreview` | `openapi:getPhotoPreview` | 200 image/*、404 |
| `data-model.dbml` | `photos.preview_path`、私有儲存 Note | `dbml:Table photos`; `dbml:Note:私有檔案儲存` | 安全讀檔 |

- [ ] T027 [P] [US3] `backend/test/contract/photo-preview.test.js` ← `research:格式、驗證與預覽`; `openapi:getPhotoPreview`; `dbml:Table photos`

### Implementation for User Story 3

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `ui-plan.md` | 格狀、preview URL | `ui-plan:§畫面與流程→瀏覽相簿` | UI |
| `contracts/http-api.yaml` | `listAlbumPhotos` 之 preview_url、`getPhotoPreview` | `openapi:listAlbumPhotos`; `openapi:getPhotoPreview` | 縮圖來源 |

- [ ] T030 [US3] `frontend/src/main.js` 格狀與空狀態 ← `openapi:listAlbumPhotos`; `openapi:getPhotoPreview`; `ui-plan:§畫面與流程→瀏覽相簿`
- [ ] T031 [P] [US3] `frontend/src/styles.css` 格狀樣式 ← `ui-plan:§畫面與流程→瀏覽相簿`; `prototype:album.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 格式、驗證與預覽 | `research:格式、驗證與預覽` | preview 衍生檔 |
| `contracts/http-api.yaml` | `getPhotoPreview` | `openapi:getPhotoPreview` | 串流預覽 |
| `data-model.dbml` | preview 路徑、無公開 URL | `dbml:Table photos`; `dbml:Note:私有檔案儲存` | 讀檔 |

- [ ] T028 [US3] `photo-service.js` preview 讀檔 ← `research:格式、驗證與預覽`; `dbml:Table photos`; `dbml:Note:私有檔案儲存`
- [ ] T029 [US3] `routes/photos.js` preview 路由 ← `openapi:getPhotoPreview`

**Checkpoint**: 格狀預覽就緒。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: E2E、文件、可觀測性。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `quickstart.md` | 全文指令與 smoke 步驟 | `quickstart:full` | T034–T036 |
| `spec.md` | 各 US Independent Test | `spec:US1`; `spec:US2`; `spec:US3` | smoke 範圍 |
| `ui-plan.md` | §驗證 · 錯誤／載入狀態 | `ui-plan:§驗證` | T033 |

- [ ] T032 [P] 後端安全日誌 ← `openapi:components.schemas.ErrorBody`; `plan:design-decisions`
- [ ] T033 [P] 前端錯誤／載入 UI ← `ui-plan:§驗證`; `spec:US1`
- [ ] T034 更新 quickstart、`.env.example` ← `quickstart:full`; `plan:structure`
- [ ] T035 執行測試與 build ← `quickstart:full`
- [ ] T036 smoke test ← `quickstart:full`; `spec:US1`; `spec:US2`; `spec:US3`

---

## Dependencies & Execution Order

- 進入任一 `####` 小節：**先 READ 必讀對照每一列**（人讀部位 + 機器錨點），再執行該小節任務。
- 依 **T 編號升序** 與各 Phase **Checkpoint**；`[P]` 僅在無檔案衝突且無依賴未完成時平行。

## Format Validation

- 每 `####` 小節有四欄 **必讀對照**；每 `Tnnn` 有 **`←` 錨點**；對照表每列至少一個任務引用。
- OpenAPI 任務必含 `openapi:{operationId}`；DB 任務必含 `dbml:Table …` 或 `dbml:Note:…`；前端必含 `ui-plan:…` 和／或 `prototype:…`；Setup／Foundational／受 research 驅動的後端任務須含對應 `research:{決策小節}`。
- 禁止僅寫「讀 http-api.yaml」而不列 operationId／path。
