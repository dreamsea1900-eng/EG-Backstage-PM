# EG站後台 PM Prototype Kit

給 PM／企劃使用的靜態 prototype 工具：把**已經想好的功能、流程與概念**交給 Claude Code、
OpenAI Codex 或其他 Agent，產出符合 EG站後台設計規範的純 HTML prototype。

PM 不需要先完成 UI 規格或 API 契約。Agent 會用 kit 內整理好的 EG 既有版型、
表單與互動慣例補齊呈現；邊界是不能自行增加 PM 沒提到的產品能力與工程邏輯。

## 使用前提

用目前已在使用的 Claude Code、Codex 或其他 Agent 開啟本 repo 即可。這套 kit
不要求 PM 安裝 Node.js、npm、套件、建置工具或本機伺服器，也不要求 PM 執行終端機指令。

Agent 產出的頁面必須能直接用瀏覽器開啟 `index.html`。樣式與互動只透過
`<link>`、`<script src>` 引用同一頁面資料夾內的 CSS／vanilla JavaScript；規格明確需要的
第三方資源才可使用鎖定版本的 CDN 連結。

Codex PM 可參考 [CODEX-PM操作流程.md](CODEX-PM操作流程.md)。

## 做一頁的流程

1. 把同一頁的規格、流程圖、現有頁面截圖與參考資料放入 `input/`。
2. 若沒有整理好的規格，可複製 [templates/SPEC-TEMPLATE.md](templates/SPEC-TEMPLATE.md) 填寫。
3. 在此資料夾開啟 Agent，輸入「開始」。
4. Agent 判斷要展示的功能，並依既有 EG 介面選擇適合的列表、表單、詳情或 Modal 版型。
5. 只要核心想法清楚就直接製作；版型與欄位排列不會丟回 PM 決定。
6. 完成後由 Agent 驗證頁面並寫入簡短工作紀錄；PM 不需審核工程報告。

## 兩種工作模式

### 原型製作（預設）

- 直接實作 PM 已描述的功能與想法。
- 未指定的 UI 呈現依 EG 既有版型補齊。
- 不加入未提及的產品能力、API 分支或工程例外。

### 概念探索

只有 PM 明確說「請幫我發想／提供方案」才啟用。提案會與正式 prototype 分開，
經 PM 核准後才成為可製作範圍。

## 交付內容

每個頁面資料夾包含：

- 可直接以瀏覽器開啟的 `index.html`
- 由 HTML 以相對路徑引用的 `css/`、`js/`、`images/`
- `SCOPE.md`：Agent 自用的簡短防幻想清單，PM 不需簽核
- `WORKLOG.md`：每輪製作與修改紀錄

## 共用 Agent 資源

所有工具共用 `agent-resources/`：

- `skills/`：邊界、切版、互動、驗證規範
- `workflows/`：新頁、修改與工作報告流程

`AGENTS.md` 與 `CLAUDE.md` 只負責指向同一份共用資源，不維護工具專屬副本。

## examples 的用途

`examples/` 只用來對標：

- Ant Design DOM 與元件註解
- CSS／JS 拆檔
- 技術完成度

不能從 examples 繼承產品功能；版型與表單呈現以 kit 內的 EG 介面參考為準。

## 不包含

- React／TSX 正式前端
- 真實 API 與後端實作
- Figma 操作
- 自動同步正式產品現況的資源庫

正式產品現況資源的更新機制是後續議題，目前不作為本 kit 運作前提。
