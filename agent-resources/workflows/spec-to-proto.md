# 新頁製作流程（spec-to-proto）

用途：把 PM 已定義的功能與想法快速轉成可展示的新 prototype。

## 0. 必讀

依序完整讀取：

1. `agent-resources/skills/prototype-boundary/SKILL.md`
2. `agent-resources/skills/antd-static-layout/SKILL.md`
3. `agent-resources/skills/antd-static-layout/references/eg-interface-patterns.md`
4. 需要展示互動時讀 `agent-resources/skills/antd-proto-interactions/SKILL.md`

讀取 `input/` 所有素材，略過 `input/README.md`。整體理解 PM 想展示的內容；
不要先輸出逐檔證據報告，也不要假設一個檔案等於一頁。

## 1. 理解展示目標

- 從 input 判斷頁面目標、主要使用者、想展示的功能與資料。
- 能合理判斷是新頁時直接進行，不先要求 PM 回覆流程分類。
- 預設原型製作。只有 PM 明確要求發想／提案才進入概念探索。
- 概念探索先交提案，不直接建立正式 prototype。

## 2. 選擇既有版型

依 `eg-interface-patterns.md` 選擇最接近的 EG 既有呈現：

- 查詢／列表
- 全頁新增或編輯表單
- 詳情摘要
- 少量就地編輯 Modal
- PM 已指定的其他形式

PM 未指定 UI 形式時，由 Agent 依既有模式決定並直接製作。不要要求 PM 補 API、
request／response、完整狀態表或工程驗收條件。

## 3. 簡短邊界

建立 `<PascalCase頁面名>/SCOPE.md`，只簡短記錄：

- PM 想展示的內容
- 採用的既有版型
- 需要展示的最短互動
- 刻意不加入的產品邏輯
- 純展示假設

這是 Agent 延續工作的內部紀錄，不先輸出成報告，也不要求 PM 簽核。只有核心功能
存在互斥解讀時才追問。

## 4. 建立與切版

建立 `index.html`、`css/`、`js/`、`images/`、`WORKLOG.md`。

- 成果不得依賴 build 或本機 server，必須能讓 PM 直接用瀏覽器開啟 `index.html`。
- CSS／JS 由 `index.html` 以相對路徑的 `<link>`／`<script src>` 引用。
- 從 `agent-resources/skills/antd-static-layout/assets/antd.css` 複製樣式。
- examples 只對標元件註解、拆檔與技術完整度，不能帶入功能、版面、狀態或假資料。
- 實作 PM 想展示的功能，並以既有版型補齊呈現。
- 可用明確標示為展示用途的合成資料與中性文案。
- 可提交操作依 EG 同類既有介面補齊最小必要欄位，並記入 `SCOPE.md` 展示假設；
  沒有可靠模式時不得做成可直接成功的假操作。
- 框架只補視覺外殼，不創造導覽項目、返回按鈕、麵包屑目的地或其他產品入口。
- 不建立或要求真實 API；不模擬工程層回滾、補償或錯誤碼。
- 背景 Log、歷程與報表不轉成可見 UI，除非會影響操作者當下判斷。
- 互動模板只能提供 DOM／JS 技術骨架，刪除不服務本次想法的分支。

## 5. 驗證與交付

由 Agent 在自身執行環境執行：

```bash
node agent-resources/skills/antd-verify/scripts/verify.js <頁面資料夾>
```

修正至 0 ERROR，修改過的 JS 加跑 `node --check`。PM 不需安裝 Node.js、npm，
也不需執行任何命令。Agent 環境無法執行時，回報驗證未完成並停止交付，
不得要求 PM 補裝工具。

交付摘要包含：

- 檔案清單
- 已完成的展示內容
- 採用的既有 EG 版型
- 刻意沒有加入的產品邏輯
- WARN 判讀

最後 append `WORKLOG.md`：

```markdown
## <YYYY-MM-DD> 開工（spec-to-proto）
- input：<檔名清單／貼上規格>
- 模式：原型製作／概念探索後製作
- 目標：<PM 想展示的功能>
- 版型：<採用的 EG 既有版型>
- 產出：<檔案數／可展示區塊摘要>
- 邊界：<刻意未加入的產品邏輯>
- 驗證：verify <輪數> 輪至 0 ERROR；WARN：<摘要／無>
- TODO：<清單／無>
```
