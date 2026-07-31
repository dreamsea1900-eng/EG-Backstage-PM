# 共用 Agent 資源

這個資料夾是本 kit 唯一的跨工具資源來源。

- `skills/`：可重用的執行規範與 assets/scripts
- `workflows/`：新頁、修改與工作報告流程

Codex、Claude Code 或其他 Agent 都由根目錄 `AGENTS.md` 路由到這裡。不要在工具私有目錄
建立內容副本或 symlink；若工具不支援原生 skill discovery，直接讀取對應 `SKILL.md`。

所有 prototype 任務先讀 `skills/prototype-boundary/SKILL.md` 與
`skills/antd-static-layout/references/eg-interface-patterns.md`，再依需要套用切版、
互動與驗證技能。介面模式已抽入 kit，日常任務不需要重新檢索正式前端 repo。

## 執行環境邊界

- PM 只準備 input、確認 `SCOPE`，並直接以瀏覽器開啟成果 `index.html`。
- PM 不安裝 Node.js、npm、套件、建置工具或本機伺服器，也不執行驗證指令。
- 頁面只使用瀏覽器可直接載入的 HTML、CSS、vanilla JavaScript 與必要的鎖版 CDN 連結。
- `skills/antd-verify/scripts/verify.js` 是 Agent 內部品質工具，不是 prototype 的執行依賴。
- Agent 環境無法執行驗證時，必須將交付標為未驗證；不得要求 PM 補裝工具。
