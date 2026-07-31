# EG站後台 PM Prototype Kit

給 PM 用 [Claude Code](https://claude.com/claude-code) 或 [OpenAI Codex](https://developers.openai.com/codex)，把流程圖＋規格直接轉成
符合 EG站後台設計規範的靜態 HTML prototype 初稿。零 React、零建置、零安裝。

## 安裝

1. 安裝 [Claude Code](https://claude.com/claude-code) 或 [Codex CLI](https://developers.openai.com/codex)（擇一皆可；Codex 建議用 workspace-write 權限模式）
2. 下載 / clone 這個 repo
3. 裝 [Node.js](https://nodejs.org/)——驗證腳本（`verify.js`）與 JS 語法檢查都靠它（Windows／macOS 皆可）；**不需要 `npm install`**

> **用 Codex 的 PM**：看 [CODEX-PM操作流程.md](CODEX-PM操作流程.md)——一頁到底、照著做就好。

## 使用（三步驟）

1. **放檔案**：把這一頁的參考圖、流程圖、規格（`.png` / `.jpg` / `.md`，**幾個檔都行、可混放**）
   全部丟進 `input/` 資料夾
2. **打開工具**：把整包 `EG-Backstage-PM` 資料夾拖進 Claude Code；用 Codex 就在這個資料夾開終端機執行 `codex`
3. **送出一句話**：打「開始」或直接按 Enter——AI 會自動讀 `input/`、先跟你確認理解、
   把對焦問題**問到清楚為止**；**正式製作前會給你一份規格確認摘要＋大概花多少 token，
   你點頭才開始**，然後產出 prototype

> `input/` 是「收件匣」，隨時可清空重放；做好的頁面資料夾才是成果，清 `input/` 不影響它。
> 詳細說明見 `input/README.md`。

AI 會依 kit 內建規範自動產出（規範在 `.claude/skills/`；Codex 經 `.agents/skills` 共用同一套）：
- `<頁面名>/index.html` ＋ `css/` ＋ `js/`（純 HTML/CSS/JS，零 React、零建置）
- `<頁面名>/WORKLOG.md`（工作紀錄，AI 自動寫；隨頁面資料夾一起交回即可）
- 交付摘要（檔案清單、TODO 清單、驗收條件對照表、本次依據的 input）

> **品質**：產出會對標 `examples/` 的黃金範例；第一版若不夠到位，說「修改 <頁面>」補 1–2 輪即可。
> 請用**夠強的模型**跑（Claude Code：Opus／Codex：最高推理檔），模型能力直接影響產出深度。

**（進階）** 不放 `input/` 也可以：直接把規格貼進對話框、跟 AI 說「**開工**」，即進入**開工模式**；
要改已完成的頁面，說「**修改 <頁面名>**」進入**新增/修改模式**。

## 怎麼寫規格，AI 才產得準

- 用【規格】／【建議】標記：【規格】＝必守；【建議】＝可依規範取捨
- 講清楚每個畫面的狀態與分支（空狀態、錯誤、載入中都要提）
- 沒定的文案／API 就寫「待定」，AI 會留 `TODO` 不亂猜
- **流程圖直接放圖**：截圖丟進 `input/` 請 AI 讀，或用文字描述進規格——兩條路都行

## 完成後

把異動交回設計師 review（push 到你 fork 的 repo 開 PR，或把資料夾傳回都行）。
**設計師 review 通過後才納入正式專案**，接續轉 Figma——這步由設計師處理，PM 不需要碰。

## 這個 kit 沒有的東西

- 不含既有頁面的實作內容（業務邏輯與設計細節在設計師的正式 repo）
- 不含 Figma 相關設定——PM 不接觸 Figma
- 不含 TSX／React 流程——只產靜態 HTML prototype
- 不需要任何 npm 套件或建置環境
