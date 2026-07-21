# EG站後台 PM Prototype Kit

給 PM 使用 [Claude Code](https://claude.com/claude-code) 直接把規格文件／wireframe 轉成
符合 EG站後台設計規範的靜態 HTML prototype 初稿。

## 安裝

1. 安裝 [Claude Code](https://claude.com/claude-code)
2. Clone 這個 repo
3. 進資料夾裝相依套件（驗證腳本需要）：

```bash
npm install
```

## 使用方式

在這個資料夾底下開 Claude Code：

```bash
claude
```

貼上你的規格文件內容（流程、狀態模型、驗收條件），或直接輸入：

```
/spec-to-proto <頁面名（可省略）> <貼上規格全文>
```

Claude Code 會依照 `.claude/skills/` 底下的規範自動產出：
- `<頁面名>/index.html` ＋ `css/` ＋ `js/`（純 HTML/CSS/JS，零 React，零建置）
- 交付摘要（檔案清單、TODO 清單、驗收條件對照表）

後續要修改某個頁面時，用：

```
/revise <頁面資料夾（可省略）> <修改意見>
```

## 完成後

把這個 repo 的異動交回設計師 review（push 到你自己 fork 的 repo 後開 PR，
或直接把異動的資料夾傳回去都可以）。**設計師 review 通過後才會被納入正式專案**，
接續轉 Figma 設計稿的流程——這一步由設計師處理，不需要 PM 執行。

## 這個 repo 沒有的東西

- 不含任何既有頁面的實作內容（業務邏輯與設計細節仍在設計師的正式專案 repo 內）
- 不含 Figma 相關設定——PM 不需要接觸 Figma MCP
- 不含 TSX／React 相關流程——本 kit 只產出靜態 HTML prototype
