# 用 Codex 做 prototype——PM 操作流程

你只需要：寫下想展示的功能或概念、用既有的 Agent 開啟資料夾、輸入「開始」。

## 不需要準備開發環境

PM 不需要安裝 Node.js、npm、套件、建置工具或本機伺服器，也不需要操作終端機。
請直接用目前已在使用的 Codex、Claude Code 或其他 Agent 開啟
`EG-Backstage-PM` 資料夾。

驗證是 Agent 的內部責任。若 Agent 所在環境無法執行 kit 的驗證工具，Agent 必須明確回報
「尚未完成驗證」，不得要求 PM 安裝 Node.js 或代為執行指令。

## 每做一頁

### 1. 準備 input

把同一頁的材料放入 `input/`：

- 規格與流程
- 現有頁面截圖／prototype（有的話能更精準，不是新頁的開工門檻）
- 欄位或操作說明
- 想展示給 review 者看的重點

不用準備 API、request／response、資料庫欄位或完整錯誤碼。

沒有規格格式時，複製 `templates/SPEC-TEMPLATE.md`。

### 2. 輸入「開始」

Codex 會：

1. 讀取所有 input 素材。
2. 理解你想展示的功能、資料與流程。
3. 從既有 EG 介面慣例選擇最適合的列表、表單、詳情或 Modal 版型。
4. 直接製作可操作的靜態 prototype。

### 3. Agent 會自行處理的內容

如果你已經說清楚「要展示什麼」，但沒有指定版型、欄位欄數、按鈕位置或表單排列，
Codex 會依 kit 內整理好的 EG 既有前端模式直接完成，不會要求你先做 UI 設計。

只有輸入互相矛盾、且不同解讀會改變核心功能時，Codex 才會追問。

### 4. 防止的幻想

Codex 不應自行增加：

- 匯出、批次操作、審核、權限或歷程入口
- PM 沒提到的新欄位、流程與結果分支
- API 錯誤碼、網路中斷、回滾、補償、重試
- 為了展示而加入的 Demo Radio、資料重設或 localStorage

## 收貨

成果資料夾包含：

- 可直接用瀏覽器開啟的 `index.html`
- 由 `index.html` 透過 `<link>`／`<script src>` 引用的 `css/`、`js/`、`images/`
- `SCOPE.md`（Agent 自用的簡短防幻想清單，不需 PM 簽核）
- `WORKLOG.md`

不需要 build，也不需要啟動 server；直接雙擊 `index.html` 即可 review。

要修改時輸入：

```text
修改 <頁面資料夾名稱>
<本輪意見>
```

Codex 只會修改受影響區塊，並同步更新簡短 `SCOPE.md`。

## 原型製作與概念探索

- 預設是**原型製作**：依既有 EG 介面補齊呈現，但不加入 PM 未提到的產品能力。
- 說「幫我發想／提出方案」才是**概念探索**。
- 探索提案不會自動進入正式 prototype，仍需你核准。

## 卡住時

| 狀況 | 處理方式 |
|---|---|
| Codex 自行增加功能 | 要求它依 `prototype-boundary` 刪除 PM 未提到的產品能力 |
| Codex 從範例照抄版面 | 提醒 examples 只能對標技術品質 |
| Codex 一直追問 UI 細節 | 要求它依 `eg-interface-patterns.md` 選擇既有版型直接製作 |
| Codex 要求 API | 提醒 API 與資料契約不是 prototype 開工條件 |
