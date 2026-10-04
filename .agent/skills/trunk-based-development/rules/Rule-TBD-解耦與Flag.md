# Rule 1 - 解耦技術必須依情境選型而非預設 Feature Flag

- Level: `MUST`
- 跨過 short-lived branch 合理期限（>1 天）且動到使用者可觸及路徑 → Feature Flag（Release Toggle），合併時 flag 預設關閉。
- 大範圍內部重構、呼叫端多、使用者無感 → Branch by Abstraction，在 trunk 上小步提交。
- 後端演算法/資料源替換需真流量驗證但不影響回應 → Dark Launch / Parallel Run。
- 範圍小且能在短命分支期限內完成 → 不需要額外解耦，走一般整合流程。

## Good Example

- 這個例子是好的，因為多日 UI 改版用 flag 關閉合併，每日仍整合回 trunk。

````text
new_checkout flag 預設 off → 每日 merge 小 PR 到 main → 完成後才 rollout。
````

## Bad Example

- 這個例子是壞的，因為內部模組替換卻開一條兩週長分支而非 BbA。

````text
refactor/notify 存活 14 天，十幾個檔案一次 merge。
````

# Rule 2 - Feature Flag 必須有治理欄位

- Level: `MUST`
- 每個 flag 須標明類型（Release Toggle vs Experiment/Ops/Permission）、名稱慣例、owner、預期存活期限；Release Toggle 上線後須排入移除，不得無限期保留。
- 測試須覆蓋 flag on/off 兩條路徑；「移除 flag」屬於 Definition of Done，不是可選清理。

## Good Example

- 這個例子是好的，因為 flag 有 owner 與到期日，DoD 包含刪除 flag 程式碼。

````text
FF_NEW_CHECKOUT owner:@team-pay expiry:2026-04-30 → rollout 100% 後開 PR 移除 flag。
````

## Bad Example

- 這個例子是壞的，因為 flag 無 owner 且上線後從未清理。

````text
程式碼中 20 個 `if (flags.X)`，無文件、無 owner、最舊已兩年。
````

# Rule 3 - Flag 不得假設能復原不相容的資料變更

- Level: `MUST`
- 若 schema/資料在 flag off 時無法安全回滾，必須使用 Expand → Migrate → Contract 分階段處理，不可假設「關 flag = 完全復原」。
- 大型 DB migration 與 flag 綁定時，須引用 `rules/Rule-TBD-例外與健康度.md` 的例外護欄。

## Good Example

- 這個例子是好的，因為先 expand schema，雙寫驗證後才切換與 contract。

````text
新增可空欄位 → 雙寫 → 切換讀取 → 移除舊欄位；flag 只控制讀取新邏輯。
````

## Bad Example

- 這個例子是壞的，因為破壞性 schema 變更綁 flag，關閉後資料不一致。

````text
刪除舊欄位後用 flag 切換新 API，關 flag 時舊客戶端直接失敗。
````

# Rule 4 - 切換 Production Flag 或 Rollout 前須確認

- Level: `MUST`
- 調高 production rollout、刪除 production flag、或切換使用者可見行為，屬高風險操作，執行前必須向使用者確認節奏與回滾方式（即使技術上可自動執行）。

## Good Example

- 這個例子是好的，因為提出 rollout 計畫並等待確認。

````text
「建議先 5% 觀察 24h，再 25%。是否同意此節奏與回滾為關閉 flag？」
````

## Bad Example

- 這個例子是壞的，因為未確認直接 100% 開 flag。

````text
使用者說「上線吧」，AI 直接將 production flag 設為 100%。
````
