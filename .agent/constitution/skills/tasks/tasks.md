# Artifact: tasks.md

skill: tasks  
overlay: true

## MUST

- 文件含 **Spec 套件索引** 與 Phase 1 **Read when executing this phase**（與 `Rule-Tasks-端點分層與按需讀取.md` 一致）。
- 每個 `#### 前端`／`#### 後端`（及 Phase 1–2 若列任務）小節開頭有 **必讀對照** 四欄表。
- 每個 `- [ ] Tnnn` 行尾含 **`←`** 機器錨點；必讀對照**每一列**至少被一個任務引用。
- Phase 3+ 每 User Story 在 Tests／Implementation 下至少有 **前端**、**後端** 兩個小節（除非 plan 明確只有單一端點且已在 plan 說明）。

## MUST NOT

- 要求「開始前讀完 spec 套件全文」作為 Prerequisites（須按需 READ）。
- 後端實作任務無 `openapi:` 錨點、持久化任務無 `dbml:` 錨點（若該 US 確有對應契約／模型）。

## 交付自檢（Agent）

- [ ] shared（繁中、追溯 ID）已滿足
- [ ] Binding 雙向覆蓋（對照表列 ↔ 任務 `←`）已檢查
- [ ] Format Validation 段落存在且與 template 一致
