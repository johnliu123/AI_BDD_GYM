# Rule 1 - Subject / body / footer 結構

- Level: `MUST`
- 模板：

````text
<type>[(scope)][!]: <祈使句、小寫開頭、無句號、subject ≤72 字元>

<body：what/why，每行 ≤100 字元，URL 例外>

<footer：BREAKING CHANGE / Refs / Closes / Co-authored-by 等>
````

- Description：祈使句（`add`、`fix`，非 `added`/`fixes`）；不用 sentence-case／PascalCase／全大寫 subject；不列檔名；避免空泛詞（`update`、`fix bug`、`wip`）；subject 含 "and" 時重新檢視 Phase 2 拆分。
- Body 寫 what + why，不寫 how。必須有 body：非顯而易見的 bug、非 trivial 的 feat 設計、核心 refactor、任何 breaking。可省略：自我解釋的瑣碎改動。
- Footer：`issue_refs_from_branch` → `Refs`/`Closes`/`Fixes`（依使用者或專案慣例）；breaking → `BREAKING CHANGE:`；`revert` → `Refs: <SHA>`；多人協作 → `Co-authored-by`。
- 完整格式與 commitlint 對照見 [spec.md](../references/spec.md) 第 4–8 節。

## Good Example

- 這個例子是好的，因為 subject 簡短祈使、body 說明 why。

````text
fix(parser): handle empty input

Return null instead of throwing when input is blank; callers expect nullable result.
````

## Bad Example

- 這個例子是壞的，因為 subject 列檔名且用過去式。

````text
Updated src/parser.ts and fixed stuff
````

# Rule 2 - 暫存訊息檔與驗證

- Level: `MUST`
- 將完整訊息寫入暫存檔（供 `validate_commit_message.py` 與 `git commit -F` 共用）；寫入時不得帶 UTF-8 BOM（Windows 見 [tooling.md](../references/tooling.md)「Windows BOM 陷阱」；優先使用編輯器 Write 工具）。
- Phase 4 須執行 `validate_commit_message.py`；`valid: false` 須修正後重跑，不得 commit。warnings 依語意判斷是否修正（如 `type-breaking-mismatch`、`subject-contains-'and'`）。

## Good Example

- 這個例子是好的，因為驗證通過後才 commit。

````text
python scripts/validate_commit_message.py --file .commit-msg.tmp --types feat,fix,...
→ valid: true → git commit -F .commit-msg.tmp
````

## Bad Example

- 這個例子是壞的，因為略過驗證。

````text
手寫 message 直接 git commit -m "fix: thing"
````
