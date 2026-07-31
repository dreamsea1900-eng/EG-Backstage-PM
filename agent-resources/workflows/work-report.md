# Kit 品質報告流程

這是維護 prototype kit 時才使用的內部品質報告，不是 PM 製作或收取單頁 prototype
的必要流程。除非設計師或 kit 維護者明確要求「工作報告」，一般任務不得產生。

用途是評估 Agent 是否：

- 正確套用 EG 既有版型。
- 把 PM 想法做成可展示內容。
- 加入 PM 未要求的產品能力或奇怪工程邏輯。
- 過度追問 API、UI 細節或要求 PM 審核內部文件。

## 步驟

1. 掃描所有成果頁面的 `WORKLOG.md`、`SCOPE.md`，排除 `examples/`、`input/`、`reports/`。
2. 統計每頁輪數、採用版型、PM 修正次數與驗證重跑次數。
3. 整理 PM 糾正項目：
   - AI 誤讀 PM 想法
   - 未遵守 EG 版型
   - AI 自行增加的產品能力或工程邏輯
   - 不必要的 API／UI 規格追問
4. 找出重複缺口，判斷應改善 input 指引、boundary skill、layout、interaction 或 verify。
5. 輸出 `reports/工作報告-<YYYYMMDD>.md`，包含總覽、各頁摘要與有統計依據的改善建議。

不得把文件更完整或工程規格更齊全當成成功指標。成功標準是 prototype 能清楚展示
PM 想法、看起來屬於既有 EG 系統，且沒有多餘產品邏輯。
