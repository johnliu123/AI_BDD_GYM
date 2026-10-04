# Rule 1 - 拆分決策須依 decision-trees 執行

- Level: `MUST`
- 判斷是否拆成多個 commit 時，須 READ [decision-trees.md](../references/decision-trees.md)「Atomic 拆分」並依序套用；不得僅因檔案數多就自動拆分。
- 判定需拆分時，須先 WRITE 依 `templates/split-plan.md` 產出完整計畫（每個 commit 的檔案／hunk），並進入 Phase 5 等待使用者確認後才 staging。

## Good Example

- 這個例子是好的，因為 feat 與無關 docs 分兩個 commit 並先呈計畫。

````text
Commit 1: feat(api): add rate limit — src/api/limit.ts, tests/...
Commit 2: docs: document rate limit — README.md
→ 使用者確認後分兩次 stage + commit。
````

## Bad Example

- 這個例子是壞的，因為 subject 含 and 仍硬塞一個 commit。

````text
fix(auth): fix login and update readme
````

# Rule 2 - 應保持同一 commit 的依賴組

- Level: `SHOULD`
- 下列變更即使檔案多，預設同一 commit：功能 + 對應測試；migration + 使用方；設定 + 讀取程式；lockfile + 觸發更新的依賴改動；codegen 產物 + 觸發生成的原始碼。
- lockfile 與觸發改動拆開為 anti-pattern，見 [anti-patterns.md](../references/anti-patterns.md)。

## Good Example

- 這個例子是好的，因為 lockfile 與 package.json 版本 bump 同一 commit。

````text
chore(deps): bump lodash to 4.17.21 — package.json + package-lock.json
````

## Bad Example

- 這個例子是壞的，因為只 commit lockfile。

````text
Commit 1: chore: update lockfile
Commit 2: chore(deps): bump lodash
````
