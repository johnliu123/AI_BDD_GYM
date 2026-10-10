---
name: implement
description: "依 feature 目錄 tasks.md 逐 Phase／端點小節／T 實作：必讀對照與 ← 錨點按需 READ、完成打 [x]。Use when executing tasks.md after /tasks; user must supply feature or tasks.md path."
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Implement

依 **`tasks.md`** 逐步完成開發：**按需 READ** spec 套件（必讀對照 + `←` 機器錨點）、**依 Phase 與 T 編號順序**執行、任務完成更新 **`tasks.md` `[x]`**。不依賴 `.specify/` 或 speckit 腳本。

**相關規則**：`rules/Rule-Implement-必讀對照與錨點解析.md`、`rules/Rule-Implement-執行順序.md`；錨點解析見 `references/anchor-resolver.md`。Tasks 格式見 `../tasks/rules/Rule-Tasks-端點分層與按需讀取.md`。

## SOP

### Phase 1 -- 定位 feature 與 tasks

1. READ 使用者輸入；**必須**取得 `tasks.md` 路徑或含 `tasks.md` 的 **feature 目錄**。未提供則 STOP，請使用者提供，**不得**自動偵測 `specs/*/`
2. THINK 令 `FEATURE_DIR` = `tasks.md` 所在目錄；確認同目錄存在 `plan.md`；若缺 `tasks.md` 則建議先 `/tasks`
3. READ 讀 `FEATURE_DIR/tasks.md` 全文（任務清單本身可一次讀；**spec 套件仍按需讀**）

### Phase 2 -- Checklist 閘門（有則啟用）

1. READ 若 `{FEATURE_DIR}/checklists/` 存在，掃描各檔 checkbox 統計；不存在則跳過本 Phase
2. THINK 若有未勾選項，展示 status 表並詢問是否繼續；使用者 no/wait/stop 則 STOP
3. WRITE 使用者 yes/proceed/continue 則進入 Phase 3

### Phase 3 -- 解析執行計畫

1. THINK 從 `tasks.md` 提取：Phase 順序、Checkpoint、`Tnnn`、`[P]`、`[USn]`、小節結構（含 Tests／Implementation 若存在）、`#### 前端` / `#### 後端`、必讀對照表、`←` 錨點
2. READ `tasks.md` 中 **Dependencies & Execution Order**（若有），與 `Rule-Implement-執行順序.md` 合併
3. THINK 識別當前應執行的 Phase；若使用者指定範圍（如「只做 US1」），僅在該範圍內執行，並說明未覆蓋 Phase

### Phase 4 -- 按 Phase 執行任務

1. READ 進入新 Phase 時：若 Phase 有 **Read when executing this phase** 或 **必讀對照**，依 `anchor-resolver.md` READ 對應錨點
2. THINK 進入每個 `#### 前端` / `#### 後端` 小節前：READ 該小節 **必讀對照** 每一列的機器錨點
3. THINK 對每個 `- [ ] Tnnn`（按 T 編號與 Dependencies，尊重 `[P]` 與同檔案約束）：
   - READ 該行 `←` 錨點（`anchor-resolver.md`）
   - 完成任務描述中的程式／測試／文件變更
   - 若該 T 描述要求執行命令或走查，執行並記錄結果
   - 通過後 WRITE 將 `tasks.md` 中該行改為 `- [x]`
4. THINK 非 `[P]` 任務失敗則 halt 該 Phase 依賴鏈；`[P]` 失敗繼續並報告
5. THINK Phase 末尾對照 **Checkpoint** 執行 `tasks.md` 記載的最小驗證

### Phase 5 -- Polish 與收尾

1. READ 執行 Polish Phase 時依 tasks 必讀對照 READ `quickstart.md` 等
2. THINK 執行 tasks 列出的 build／smoke（若存在）
3. WRITE **Completion Report**：已完成 T 列表、未完成 T、依 tasks 執行的驗證命令與結果、與 `spec.md` Independent Test 的對照、剩餘風險
4. THINK 若錨點無法解析或實作與 spec／openapi／dbml 衝突且未澄清，不得宣稱全部完成

## 自 speckit-implement 採納與排除

| 採納 | 排除 |
|---|---|
| Phase 順序、[P]／同檔規則、失敗 halt、tasks 打 `[x]`、checklist 有則掃描 | TDD／強制 Tests 先於 Implementation、`check_prerequisites.py`、一次讀完整包 spec、extensions.yml hooks、ignore 矩陣自動產生、`.specify/constitution` 硬依賴 |
