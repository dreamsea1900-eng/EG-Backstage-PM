---
description: 規格文件開工儀式（EG站後台：解析規格→建資料夾腳手架→切版與互動→驗證→驗收對照表交付）
argument-hint: <PascalCase頁面名（可省略，由規格推斷）> <實作規格文件全文>
---

依下列規格文件建立新頁面 prototype。**貼上規格＝執行授權**，不需再逐次確認計畫；
僅在「規格不清楚」或「與專案規範抵觸」時中斷提問（發現的問題一次問完）。

$ARGUMENTS

固定步驟：

1. **讀規則**：讀 `doc/decisions.md`（已沉澱規則直接遵循、被標註推翻的不再沿用）。
2. **解析規格**：
   - 【規格】／【建議】分流：【規格】必守，【建議】依專案規範取捨並在交付摘要說明
   - 整理 user flow 的狀態與分支清單（含邊界情境），作為互動實作與驗收對照的底稿
   - 比對 `antd-static-layout`、`antd-proto-interactions` 與 decisions.md，列出抵觸／缺漏——有就先問
   - 規格未定義的文案／API／常數／清單一律留 `TODO` 註記，不臆測
3. **建資料夾腳手架**：`<PascalCase頁面名>/`——
   `css/antd.css` 由 `.claude/skills/antd-static-layout/assets/antd.css` 複製、
   `js/tailwind-config.js` 用 antd-static-layout §2 固定內容、`css/base.css` 最小全域設定；
   其餘 css／js 依區塊拆檔規劃（後續修改只讀小檔）。
4. **切版與互動**：切版遵循 `antd-static-layout`（元件註解＋react-icons 標註＋variant class）；
   互動與 mock 遵循 `antd-proto-interactions`，**起手先複製其 `assets/` 模板**（toast／modal／demo-radio）再改前綴；
   文案用規格中文；demo 專用控制項一律註記「轉 Figma 時忽略」。
5. **驗證**：`bash .claude/skills/antd-verify/scripts/verify.sh <頁面資料夾>` 跑到 0 ERROR／判讀 WARN；
   有 JS 加跑 `node --check`。
6. **交付摘要**（固定格式）：
   - 檔案清單、TODO 清單、沿用／新建元件說明
   - **驗收條件對照表**：規格的每條驗收條件 ↔ 實作位置（檔案／區塊）與達成狀態
   - 過程中屬通則的決策記入 `doc/decisions.md`
