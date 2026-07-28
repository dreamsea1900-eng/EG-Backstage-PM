---
description: 工作報告（設計師端）——彙整各頁 WORKLOG 與 git 歷史，產出流程優化依據報告
argument-hint: <（可省略）指定頁面或範圍；預設彙整全部頁面>
---

這是**工作報告**彙整指令，供**設計師**收回 PM 成果後使用（PM 日常不需執行）。
目的：把各頁 `WORKLOG.md` 的過程數據整理成一份報告，作為優化 kit 與操作流程的依據。

$ARGUMENTS

固定步驟：

1. **蒐集**：讀所有 `<頁面名>/WORKLOG.md`（排除 `examples/`、`input/`、`reports/`）；
   輔以 `git log --oneline` 對照各頁時間軸。找不到任何 WORKLOG 時直接說明並停止。
2. **統計**（過程數據優先）：
   - 各頁輪數：開工 1 輪＋修改 R 幾輪
   - 對焦題數與答案來源分布（PM選／預設／推測）；回述糾正清單（AI 誤讀了什麼）
   - 修改意見分類統計（視覺／互動／規格補充／bug／誤解修正）
   - 驗證重跑次數、TODO 餘留狀況
3. **歸納**：找重複出現的缺口與意見類型，對應到 kit 可優化處——
   8 槽位要不要增修、`README.md`／`input/README.md` 的規格教學要不要補、
   skills（`antd-static-layout`／`antd-proto-interactions`／`antd-verify`）規則要不要調。
4. **輸出**：寫入 `reports/工作報告-<YYYYMMDD>.md`（`reports/` 不存在則建立）——
   結構：總覽表（每頁一列：輪數／對焦題數／推測數／糾正數／TODO 餘留）→ 各頁摘要 →
   **建議優化方向**（條列，每條附「依據＝哪個統計」）；並在對話給出重點摘要。
