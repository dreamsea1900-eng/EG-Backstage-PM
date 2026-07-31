# EG站後台 PM Prototype Kit（Agent 入口）

本專案供 PM／企劃把已經想好的功能、流程與概念快速轉成可 review 的靜態 HTML prototype。
PM 不需要先完成 UI 規格、API 契約或工程驗收條件。Agent 應依既有 EG 前端的視覺語言、
常見版型與表單慣例補齊呈現，同時避免加入 PM 沒提到的產品能力與奇怪邏輯。

## 共用資源位置

所有 Agent 共用同一份工具中立資源，位於 `agent-resources/`：

- 技能：`agent-resources/skills/<skill-name>/SKILL.md`
- 工作流程：`agent-resources/workflows/*.md`
- 共用說明：`agent-resources/README.md`

不得在 `.claude/`、`.agents/`、`.codex/` 複製或維護另一份規範。工具原生 skill
發現或斜線指令若不可用，直接依本入口讀取上述檔案。

## 強制路由

處理任務前，主 Agent 必須完整讀取所列檔案：

| 任務 | 必讀資源 |
|---|---|
| 任何新頁、改頁、規格轉 UI | `agent-resources/skills/prototype-boundary/SKILL.md` |
| 靜態 HTML 切版 | `agent-resources/skills/antd-static-layout/SKILL.md` |
| 選擇 EG 既有版型與表單呈現 | `agent-resources/skills/antd-static-layout/references/eg-interface-patterns.md` |
| 規格已定義互動、Modal、toast、loading 或 mock | `agent-resources/skills/antd-proto-interactions/SKILL.md` |
| 新頁製作 | `agent-resources/workflows/spec-to-proto.md` |
| 修改既有 prototype | `agent-resources/workflows/revise.md` |
| 每輪頁面異動後 | `agent-resources/skills/antd-verify/SKILL.md` |
| 設計師要求「工作報告」 | `agent-resources/workflows/work-report.md` |

若多個技能適用，依 `prototype-boundary` → `antd-static-layout` →
`antd-proto-interactions` → `antd-verify` 的順序使用。

## session 啟動

`input/` 內若有 `README.md` 以外的檔案，session 第一回合要：

1. 掃描並讀取所有素材。
2. 從素材判斷 PM 想展示的功能、資料與流程。
3. 依 `eg-interface-patterns.md` 選擇最接近的既有版型。
4. 能合理判斷交付物時直接製作；不要先輸出證據報告或要求 PM 確認 SCOPE。

`input/` 空時，等待 PM 提供需求。`examples/` 只用來對標技術品質，不能作為功能來源。

## 核心邊界

- PM 描述的功能與想法就是 prototype 的主要輸入，不要求 API、資料庫或完整工程規格。
- 既有 EG 慣例可以決定版型、元件、表單排列與操作位置，但不能增加產品能力。
- 未指定呈現方式時，由 Agent 選擇最接近的既有版型並直接製作，不把 UI 設計題丟回 PM。
- 可提交操作必須符合「最小完整操作」：使用 EG 同類既有介面的最少必要欄位；
  不得因怕補欄位而做出無內容卻直接成功的假操作。
- 版型外殼不得創造側欄項目、麵包屑、返回按鈕或其他產品入口。
- 背景 Log、歷程、報表、回滾與補償不轉成 UI，除非會影響操作者當下判斷。
- 只有輸入互相矛盾、且會改變核心功能時才暫停追問。
- 不以「常見後台都有」為由補出匯出、批次、審核、權限、歷程入口、通知、重試或回滾。
- 只有 PM 明確要求「發想／提案／探索」時才可提出方案；提案不得混入正式規格或 prototype。
- 展示資料可以使用中性合成值，但不得暗示 PM 未定義的業務規則。

完整規則以 `agent-resources/skills/prototype-boundary/` 為準。

## 交付定義

每個頁面資料夾必須包含：

- 可直接由瀏覽器開啟的 `index.html`
- 由 `index.html` 以相對路徑引用的 `css/`、`js/`、`images/`
- `SCOPE.md`：Agent 自用的簡短原型邊界，不是 PM 簽核報告
- `WORKLOG.md`：每輪製作／修改紀錄

一輪交付必須同時完成：

1. `antd-verify` 為 0 ERROR。
2. 頁面符合 PM 想展示的內容與 EG 既有版型。
3. 所有可點擊與可提交操作皆完整、沒有死按鈕或假成功。
4. `WORKLOG.md` 已追加本輪紀錄。

## 資料夾角色

| 路徑 | 用途 |
|---|---|
| `input/` | 一次一頁的可拋棄素材收件匣 |
| `examples/` | 唯讀技術品質範例，不是需求或版面來源 |
| `<頁面名>/` | 實際 prototype 成果 |
| `agent-resources/` | 跨工具共用技能、流程與資產 |
| `templates/` | PM 可複製使用的規格模板 |
| `docs/` | kit 的議題、決策與設計文件 |
| `reports/` | 設計師彙整工作報告的輸出 |

## 技術限制

- 純 HTML／CSS／vanilla JavaScript，不使用 React、不建置、不安裝套件。
- 不依賴本機伺服器；成果必須能直接開啟 `index.html`。
- CSS 與 JavaScript 只以 `<link>`、`<script src>` 載入，不使用 inline style／script。
- PM 零安裝、零指令：不得要求 PM 安裝 Node.js、npm 或執行驗證命令。
- 驗證工具只由 Agent 在自身執行環境使用；環境不支援時必須回報未驗證，不得把責任轉給 PM。
- Ant Design 靜態樣式由共用 skill assets 複製。
- 非 Ant Design 第三方庫只有在規格明確需要時才能以鎖版 CDN 引入。
- API、資料庫與正式錯誤碼不屬 prototype 依賴，不得要求 PM 提供。
- 未定文案可使用明確標示為展示用途的中性內容，不宣稱是正式產品文案。
