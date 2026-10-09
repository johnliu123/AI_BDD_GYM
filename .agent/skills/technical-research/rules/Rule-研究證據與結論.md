# Rule 1 - 已驗證的技術主張必須附上可追溯且相符的來源

- Level: `MUST`
- 每項以研究證實的技術行為、相容性或版本資訊作為決策依據時，必須提供可追溯來源；可在主張旁附連結，或在參考清單中清楚說明該來源支持的主張。
- 優先使用官方文件、標準或其他一手來源；來源內容必須符合本次目標版本、執行環境及適用條件。
- 找不到足以支持主張的來源時，必須標明尚未查證或證據限制，不得寫成已驗證事實。

## Good Example

- 這個例子是好的，因為 Node.js 內建測試執行器的主張連到對應官方文件，足以直接核對該能力。

```md
- **Decision**: 使用 Node.js 內建 Test Runner 執行測試。
- **Evidence**: [Node.js Test Runner](https://nodejs.org/api/test.html) 說明內建測試執行器的使用方式。
```

## Bad Example

- 這個例子不合格，因為相同主張只連到 Node.js 首頁，無法直接定位或核對測試執行器的依據。

```md
- **Decision**: 使用 Node.js 內建 Test Runner 執行測試。
- **Evidence**: [Node.js](https://nodejs.org/)。
```

# Rule 2 - 研究結論必須區分已確認需求、查證事實、建議與未決事項

- Level: `MUST`
- 已確認需求必須能追溯至規格或使用者確認；查證事實必須符合「已驗證的技術主張必須附上可追溯且相符的來源」。
- 研究建議不得表述成使用者已確認或規格已要求的決策；尚未選定的技術、版本或限制必須標示為未決。
- 研究產物必須能從章節、欄位或明確措辭辨認各項結論屬於上述哪種狀態。

## Good Example

- 這個例子是好的，因為它將規格確認的資料庫需求、研究建議的版本選擇，以及尚未定案的 runtime 版本分開標示。

```md
## 已確認需求
- 使用者指定使用 MySQL。

## 研究建議
- 建議採用 MySQL 8.4；此版本選擇尚待確認。

## 尚未決定
- Node.js 的具體 LTS 版本尚未決定。
```

## Bad Example

- 這個例子不合格，因為它把同一項尚待確認的版本建議寫成使用者已確認的需求。

```md
## 已確認需求
- 使用者指定使用 MySQL。
- 使用者已確認採用 MySQL 8.4。

## 尚未決定
- Node.js 的具體 LTS 版本尚未決定。
```

# Rule 3 - 技術堆疊只列研究文件明確採用的決策

- Level: `MUST`
- `techstack.md` 的每一項採用技術或決策，都必須對應至 `research.md` 中明確作為採用方案的 Decision；技術僅出現在參考資料、替代方案或背景說明，不足以列為已採用。
- 尚未確認的建議、版本或方案必須列於未決事項，不得與已採用技術混列。
- 技術堆疊表的每一列必須標示可定位 `research.md` 對應決策的標題或連結。

## Good Example

- 這個例子是好的，因為 Express 是研究中的明確採用決策，MySQL 版本仍未指定，而只出現在參考資料的測試執行器沒有被誤列為採用技術。

```md
`research.md`：
### API 後端
- **Decision**: 使用 Express 提供 JSON API。

`techstack.md`：
| API 後端 | Express | 提供 JSON API | [API 後端](./research.md#api-後端) | 套件版本未指定 |

## 尚未固定的版本與選項
- MySQL 具體版本尚未決定。
- 測試執行器尚未選定。
```

## Bad Example

- 這個例子不合格，因為 MySQL 8.4 和 Node.js Test Runner 雖出現在研究參考中，並未被研究文件明確選為採用方案。

```md
`research.md`：
- **Decision**: 使用 MySQL 保存中繼資料。
- 技術參考：MySQL 8.4 日期型別文件、Node.js Test Runner 文件。

`techstack.md`：
| 資料庫 | MySQL 8.4 | 保存中繼資料 | 未連回採用決策 | 已採用 |
| 測試 | Node.js Test Runner | 執行測試 | 只出現在參考資料 | 已採用 |
```
