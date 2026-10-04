# Commit 決策樹（按需 READ）

本檔承接原 SKILL 內的判定樹；SOP 在 Phase 2–3 依情境 READ 對應章節。

## Atomic 拆分（Phase 2）

對整組變更依序判斷，命中即停：

1. **"And" 測試**：能否用一句話、不含「and／以及／和」描述？不能 → 拆分。
2. **可還原測試**：只 revert 一部分時，其餘是否仍可運作／編譯？互相依賴 → 同一 commit；可獨立 → 拆分訊號（仍看下一條）。
3. **關注點是否相同**：是否混雜不同性質（新功能 + 無關 bug fix、邏輯 + 純格式、功能 + 無關依賴升級）？是 → 拆分。
4. **不拆例外**：
   - 功能程式碼 + 對應測試
   - Migration + 使用該 migration 的 model／程式碼
   - 設定檔 + 讀取該設定的程式碼
   - lockfile + 觸發該更新的改動
   - codegen／schema 產物 + 觸發重新生成的原始碼
5. **僅為檢查訊號**：跨多個不相關目錄、staged 檔案 > 10 — 用前四條實際判斷，非自動拆分。

單檔內不同 hunk 需 hunk 級 staging 時，見 [tooling.md](tooling.md) 第 1 節。

## Type（Phase 3）

```
這個改動...
├─ 撤銷之前的 commit？                              → revert
├─ 只改 .github/workflows、.gitlab-ci.yml、Jenkinsfile？ → ci
├─ 只改 build 工具／打包設定／npm scripts（非 CI）？       → build
├─ 只新增／修改測試檔，沒動產品程式碼？                    → test
├─ 只改文件（README、註解、docs/）？                     → docs
├─ 純格式（空白、分號、排版），邏輯完全沒變？               → style
├─ 修正「不符合預期的行為」（含順便修的）？                → fix
│    └─ 標準：使用者／呼叫端觀察到行為從「錯」變「對」
├─ 引入「原本不存在」的新能力／功能？                     → feat
│    └─ 標準：全新引入，非修復缺失的預期行為
├─ 改結構、外部行為不變、也不是修 bug？                   → refactor
├─ 純效能提升、行為不變？                              → perf
└─ 不影響 src/test 且以上皆不符合？                      → chore
```

**fix vs refactor**：有無「不對的行為」被糾正？有 → `fix`。詳見 [anti-patterns.md](anti-patterns.md) #5。

Phase 0 的 `detected_type_enum` 若與預設 11 種不同，以偵測清單為準。定義表見 [spec.md](spec.md) 第 2 節。

## Scope（Phase 3）

```
├─ 專案很小／單一模組？                    → 不加 scope
├─ 變更集中在單一模組？                    → scope = 模組名
│    └─ 是否已在 Phase 0 scopes_used / detected_scope_enum？
│         是 → 沿用；否 → 最接近的既有詞，或詢問是否新增
├─ 跨多個不相關模組（且 Phase 2 不拆）？    → 不加 scope（或回頭拆分）
└─ build/ci/chore(release) 等專案層雜務？  → 通常不加 scope
```

一致性優先於最精確詞彙。格式：小寫 kebab-case。見 [anti-patterns.md](anti-patterns.md) #7。

## Breaking Change（Phase 3）

```
是否要求「使用它的人」改程式碼／設定才能維持原行為？
├─ 公開 API／HTTP contract 改變？           → 是
├─ 移除／改名 export、CLI 參數、設定鍵？    → 是
├─ 改預設值或預設行為？                     → 是
├─ 需資料遷移的 DB schema？                 → 是
├─ 提高依賴／執行環境最低版本？             → 是
├─ 純內部、無外部呼叫端？                   → 否
└─ 不確定是否有未知消費者？                 → 詢問使用者，不猜
```

標記方式：`!`、footer `BREAKING CHANGE:`（全大寫、在 footer）、或兩者；一 commit 一個 breaking。詳見 [spec.md](spec.md) 第 7 節、[anti-patterns.md](anti-patterns.md) #2、#3。
