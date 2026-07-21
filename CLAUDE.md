# EG站後台 PM Prototype Kit

## 這是什麼

這份 repo 是「EG站後台」專案給 **PM 自行使用** 的 prototype 產出工具。
用 Claude Code＋這裡的規範，PM 可以直接把自己的規格文件／wireframe 轉成
符合設計規範的靜態 HTML prototype 初稿，不需要每次都等設計師手動切版。

## 工作流程

1. **準備規格**：整理好的規格文件（流程、狀態模型、驗收條件等）
2. **產出 prototype**：貼上規格即視為執行授權，建議用 `/spec-to-proto` command
   （規則：先讀 `doc/decisions.md`→ 解析規格 → 建頁面資料夾 → 切版與互動 → 驗證 → 交付摘要）
3. **多輪修改**：同一頁面有後續調整意見時，用 `/revise` command
4. **驗證**：每輪產出／修改後執行 `antd-verify`（靜態模式），跑到 0 ERROR
5. **交回設計師 review**：完成後把這個 repo 的異動（或 diff／PR）交給設計師，
   **設計師 review 通過後才會被納入正式專案**（`EG站後台`），繼續走轉 Figma 設計稿的流程；
   **這一步由設計師執行，PM 不需要處理 Figma**

## 資料夾結構

| 資料夾 | 用途 |
|---|---|
| `<頁面名>/` | 每個頁面／需求一個獨立資料夾，內部結構依 `antd-static-layout` 第 1 節（`index.html` ＋ `css/` ＋ `js/` ＋ `images/`） |
| `doc/decisions.md` | PM 端修正沉澱記錄；跟正式專案的 `decisions.md` 是分開的兩份，設計師 review 時會視需要把有價值的規則摘要採納回正式專案 |
| `.claude/skills/` | `antd-static-layout`（靜態切版規範）、`antd-proto-interactions`（互動與 mock 慣例）、`antd-verify`（驗證，靜態模式） |
| `.claude/commands/` | `/spec-to-proto`（規格開工儀式）、`/revise`（多輪修改儀式） |

## 產出規範（固定）

- **零 React**：純 HTML／CSS／JS 靜態頁面，不建置打包環境；Ant Design 5 樣式抽出後套用，
  需要非 antd 的第三方庫（圖表、地圖等）時以 CDN 引入並鎖版本
- **不用寫 TSX、不用交付 FD**——這份 kit 的產出物終點就是靜態 HTML prototype，
  後續轉 Figma 由設計師在正式專案處理
- 規格未定義的文案／API／常數一律留 `TODO` 註記，不要自己臆測

## 迭代沉澱規則

- 每次開工前先讀 `doc/decisions.md`——已沉澱的規則直接遵循
- 每輪修改處理完，判斷哪些屬於「通則」，追加至 `doc/decisions.md`
- 這份 `decisions.md` 只在這個 PM repo 內累積，不會自動同步回正式專案，
  設計師 review 時會人工判斷要不要採納

## 環境需求

- Node.js（跑 `antd-verify` 驗證腳本與 `antd-static-layout` 的 `extract.mjs` 需要）
- 進資料夾後先 `npm install`
- 不需要 Figma MCP、不需要任何建置工具
