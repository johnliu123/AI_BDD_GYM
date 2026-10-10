# Rule 1 - 分析過程 strictly 唯讀

- Level: `MUST`
- 不得建立、修改、刪除 FEATURE_DIR 內任何產物或儲存庫其他檔案。
- 不得 invoke 會寫入 spec／plan／tasks／契約的 skill，除非使用者在本 session **明確** 要求修復且另行下指令。
- 報告僅在對話中輸出；除非使用者要求另存報告檔，否則不寫入 `analysis-report.md`。

## Good Example

- 這個例子是好的，因為它列出問題並建議 `/tasks`，但未改 tasks.md。

```text
Finding E3：FR-007 無對應 Tnnn → 建議手動在 tasks.md US2 後端小節新增任務，或重新執行 `/tasks`。
是否要我提出具體草稿？（尚未寫入檔案）
```

## Bad Example

- 這個例子是壞的，因為分析 skill 直接改寫 spec 以「順手修復」。

```text
已幫你在 spec.md 合併重複 FR，並更新 tasks.md 錨點。
```

# Rule 2 - 憲法為產物內容的最高權威

- Level: `MUST`
- 分析時以 `.agent/constitution/CONSTITUTION.md` 登錄的 MUST 為準；與 spec、plan、tasks 衝突者 **一律 CRITICAL**。
- 不得在分析中建議「忽略憲法」或 reinterpret 憲法以迁就草稿；若原則本身需變更，須指向 `/constitution` 或憲法修訂流程，與本 skill 分離。
- 憲法未登錄之 artifact：以該 skill 的 rules／templates MUST 作為次級權威。

## Good Example

- 這個例子是好的，因為它標 CRITICAL 並指向修 spec 或修憲，而非弱化原則。

```text
C1 | Constitution | CRITICAL | spec.md | 正式說明混用簡體 | 依 shared 說明文字改繁中，或修憲例外 |
```

## Bad Example

- 這個例子是壞的，因為將憲法 MUST 降級為「建議改善」。

```text
憲法要求繁中，但 spec 用簡體也許可接受，LOW 即可。
```

# Rule 3 - 不得臆造未讀取或不存在的内容

- Level: `MUST`
- 若章節、檔案、錨點目標不存在，須如實報告 Missing，不得假設其內容。
- 引用 location 時盡量標檔名與章節／行號（若可得）；無法定位時標「檔名／段落關鍵字」。
- 重跑分析且產物未變時，finding ID 與計數應保持一致（穩定排序：先 CRITICAL 再依類別與 ID）。

## Good Example

- 這個例子是好的，因為它承認 openapi 檔未讀全文，僅驗證錨點是否存在。

```text
已確認 `contracts/http-api.yaml` 存在；`openapi:importPhoto` 在檔內有對應 operationId（標題掃描）。
```

## Bad Example

- 這個例子是壞的，因為未開檔即宣稱 API 已完整覆蓋所有 FR。

```text
http-api 一定涵蓋全部後端需求，無缺口。
```
