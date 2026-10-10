---
name: ui-plan
description: "分析前端與 UI：產出 ui-plan.md（範疇、畫面與流程、實作、驗證）及可操作的靜態 HTML 雛形 prototype/。通常由 /system-analysis 委派。Use when planning UI/UX with reviewable HTML prototypes from a feature spec."
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# UI Plan

分析**前端／使用者介面**端點：產出 **`ui-plan.md`** 與 **`prototype/`** 靜態 HTML 雛形（假資料、流程級互動），不實作正式產品後端、不設計 API 或資料庫。雛形須像真實產品，不得做成規格說明頁。若由 `/system-analysis` 委派，僅覆蓋委派中的端點與分析邊界。

## SOP

### Phase 1 -- 確認輸入與分析邊界

1. READ 讀取功能規格、`plan.md`（若有）、研究文件、委派指令中的端點範圍與分析邊界，以及計畫指定的前置產物；若 `ui-plan.md` 或 `prototype/` 已存在，先讀取以便整合。
2. READ 讀取 `rules/Rule-UI-分析邊界與追溯.md`。
3. THINK 將規格與 plan 對應到畫面清單、流程與視覺方向；不修改或擴張已確認需求。
4. THINK 若缺少會改變畫面結構、核心流程、雛形頁數或驗收方式的高影響資訊，透過 `/clarify` 收斂；未取得回答前停止。

### Phase 2 -- 分析畫面、流程與視覺

1. THINK 整理主要旅程、畫面／HTML 檔對應、互動與空狀態／錯誤態；對應 User Story／FR 或 plan 需求部位。
2. THINK 決定雛形頁數：需換頁或獨立畫面 → 多個 `.html`；單頁可走完 → 至少一個 `.html`。
3. THINK 定義流程級互動（導覽、toast、假上傳、以點選兩項等方式模擬拖放等）與正式前端的實作取向（對齊 plan 技術棧）。
4. THINK 記錄前端限制與非目標，來源須可追溯至規格或 `plan.md`。

### Phase 3 -- 產出 ui-plan.md

1. THINK 依專案慣例或委派指令決定輸出路徑；預設與 `plan.md` 同目錄下的 `ui-plan.md`，並在同目錄建立 `prototype/`。
2. READ 讀取 `templates/ui-plan.template.md` 與 `templates/ui-plan.example.md`。
3. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`ui-plan.md`）。
4. WRITE 依模板撰寫四段結構（範疇、畫面與流程、實作、驗證），列出雛形檔名對應；移除未使用區塊與所有佔位符；產物 MUST 以憲法為最高優先。

### Phase 4 -- 產出 prototype/ HTML 雛形

1. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`prototype/`）。
2. READ 讀取 `templates/prototype.example/` 的結構與互動粒度（範例為相簿整理器）；依功能調整頁面與假資料，必要時參照 `templates/prototype.template/` 骨架。
3. WRITE 在輸出目錄 `prototype/` 建立靜態 HTML 與 `assets/`（CSS/JS）；使用假資料，不呼叫真 API；可 localStorage 模擬重新整理後仍保留的演示狀態；產物 MUST 以憲法為最高優先。
4. WRITE 確保每個主要畫面可從瀏覽器直接開啟操作，且版面為產品 UI，非 Markdown 說明轉 HTML。
5. WRITE 整合既有雛形時保持與 `ui-plan.md` 一致；衝突須釐清。

### Phase 5 -- 驗證並交付

1. READ 對照規格、委派邊界、`ui-plan.md` 與 `prototype/`，確認需求部位皆有文件與可見畫面覆蓋，且未寫入 API、資料模型或後端實作。
2. THINK 依「驗證」章節走查雛形主流程與關鍵狀態；與 `plan.md` 設計決策一致。
3. EXEC **Phase Self-check**（artifact=`ui-plan.md`）；EXEC **Phase Self-check**（artifact=`prototype/`）。
4. WRITE 回報 `ui-plan.md` 路徑、`prototype/` 入口 HTML、涵蓋需求部位、待確認事項、供 `/api-plan` 使用的前端流程摘要，以及各 artifact 的 `Constitution self-check`（格式見 artifact-overlay-sop）。
