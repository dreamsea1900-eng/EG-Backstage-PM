# EG站後台 PM Prototype Kit

## 這是什麼

這份 kit 讓 PM 用 Claude Code，把自己的流程圖＋規格文件直接轉成
符合 EG站後台設計規範的靜態 HTML prototype 初稿——零 React、零建置、零安裝。
產出後交設計師 review，通過才納入正式專案並轉 Figma（轉 Figma 由設計師處理）。

## 主流程

1. **準備規格文件**：把流程圖與規格整理成一份文字文檔（見「如何準備規格」）
2. **產出 prototype**：貼上規格即視為執行授權，依 `/spec-to-proto` 流程
   （解析規格 → 建頁面資料夾 → 切版與互動 → 驗證 → 交付摘要）
3. **多輪修改**：同一頁面後續調整，依 `/revise` 流程
4. **每輪驗證**：改完跑 `antd-verify`（靜態），到 0 ERROR
5. **交回設計師 review**：通過後才納入正式專案；轉 Figma 由設計師執行，PM 不碰

## 如何準備規格

- 用【規格】／【建議】標記分流：【規格】＝必守的硬需求；【建議】＝可依規範取捨
- 描述清楚 user flow 的狀態與分支（含邊界情境：空狀態、錯誤、載入中）
- 未定的文案／API／常數就直說「待定」，Claude 會留 `TODO` 不臆測
- **流程圖可以直接放圖**：把截圖丟進資料夾請 Claude 讀圖，或用文字把流程描述進規格

## 產出規範（固定）

- 純 HTML／CSS／JS 靜態頁面，零 React、不建置打包；Ant Design 5 樣式已抽好、直接套
- 需要非 antd 的第三方庫（圖表、地圖等）以 CDN 引入並鎖版本
- 規格未定義的文案／API／常數一律留 `TODO`，不臆測
- 詳細切版規則見 `.claude/skills/antd-static-layout`，互動與 mock 見 `antd-proto-interactions`

## 資料夾結構

| 資料夾 | 用途 |
|---|---|
| `<頁面名>/` | 每個頁面一個資料夾，內部結構依 `antd-static-layout` 第 1 節（`index.html`＋`css/`＋`js/`＋`images/`） |
| `.claude/skills/` | `antd-static-layout`（切版）、`antd-proto-interactions`（互動與 mock）、`antd-verify`（驗證） |
| `.claude/commands/` | `/spec-to-proto`（開工儀式）、`/revise`（多輪修改儀式） |

## 環境需求

- Claude Code
- Node.js（僅用於 `node --check` 檢查 JS 語法；驗證腳本 `verify.sh` 是純 bash）
- **不需要 `npm install`、不需要任何建置工具、不需要 Figma**
