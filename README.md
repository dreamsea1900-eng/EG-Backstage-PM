# EG站後台 PM Prototype Kit

給 PM 用 [Claude Code](https://claude.com/claude-code)，把流程圖＋規格直接轉成
符合 EG站後台設計規範的靜態 HTML prototype 初稿。零 React、零建置、零安裝。

## 安裝

1. 安裝 [Claude Code](https://claude.com/claude-code)
2. 下載 / clone 這個 repo
3. （選用）裝 Node.js——只有要對 JS 做語法檢查時用得到；**不需要 `npm install`**

## 使用

在這個資料夾底下開 Claude Code：

```bash
claude
```

把你的規格文件貼進去，或直接輸入：

```
/spec-to-proto <頁面名（可省略）> <貼上規格全文>
```

Claude Code 會依 `.claude/skills/` 的規範自動產出：
- `<頁面名>/index.html` ＋ `css/` ＋ `js/`（純 HTML/CSS/JS，零 React、零建置）
- 交付摘要（檔案清單、TODO 清單、驗收條件對照表）

後續修改某頁，用：

```
/revise <頁面資料夾（可省略）> <修改意見>
```

## 怎麼寫規格，AI 才產得準

- 用【規格】／【建議】標記：【規格】＝必守；【建議】＝可依規範取捨
- 講清楚每個畫面的狀態與分支（空狀態、錯誤、載入中都要提）
- 沒定的文案／API 就寫「待定」，Claude 會留 `TODO` 不亂猜
- **流程圖直接放圖**：截圖丟進資料夾請 Claude 讀，或用文字描述進規格——兩條路都行

## 完成後

把異動交回設計師 review（push 到你 fork 的 repo 開 PR，或把資料夾傳回都行）。
**設計師 review 通過後才納入正式專案**，接續轉 Figma——這步由設計師處理，PM 不需要碰。

## 這個 kit 沒有的東西

- 不含既有頁面的實作內容（業務邏輯與設計細節在設計師的正式 repo）
- 不含 Figma 相關設定——PM 不接觸 Figma
- 不含 TSX／React 流程——只產靜態 HTML prototype
- 不需要任何 npm 套件或建置環境
