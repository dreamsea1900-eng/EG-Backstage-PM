# EG站後台 PM Prototype Kit（Agent 工作規範）

> **本檔是唯一規範來源**，Claude Code 與 OpenAI Codex 通用；`CLAUDE.md` 僅是 Claude Code 的
> 讀取入口（`@AGENTS.md` import）。要改規範一律改本檔，不要把內容寫進 `CLAUDE.md`。

## 這是什麼

這份 kit 讓 PM 用 Claude Code 或 Codex，把自己的流程圖＋規格文件直接轉成
符合 EG站後台設計規範的靜態 HTML prototype 初稿——零 React、零建置、零安裝。
產出後交設計師 review，通過才納入正式專案並轉 Figma（轉 Figma 由設計師處理）。

## 工具對應（其他章節與 commands 會引用本節）

| 機制 | Claude Code | Codex CLI |
|---|---|---|
| 規範入口 | `CLAUDE.md`（import 本檔） | `AGENTS.md`（本檔） |
| Skills | `.claude/skills/`（自動列出） | `.agents/skills/`（symlink 至 `.claude/skills`）自動發現，亦可 `$` 提及 |
| 流程指令 | `/spec-to-proto`、`/revise`，或自然語 | 自然語（依下方「指令路由」） |
| **選項確認** | AskUserQuestion 工具（點選） | 純文字**編號選項**提問（PM 回編號） |
| token 基準 | 1M context | 當前模型 context 上限 |
| 建議模型 | Opus | 最高推理檔 |

- 本 kit 文件（含 commands、skills）中出現「**選項確認**」一詞＝依上表行事：有選項式提問工具
  就用工具點選；沒有就以「1.／2.／3.」編號選項純文字發問並附最佳猜測預設，PM 回編號即可。
- **指令路由**（不支援 `.claude/commands` 斜線指令的工具適用）：PM 說「**開工**」或貼規格要做新頁
  → 讀取並遵循 `.claude/commands/spec-to-proto.md`；PM 說「**修改 <頁面>**」
  → 讀取並遵循 `.claude/commands/revise.md`；設計師說「**工作報告**」
  → 讀取並遵循 `.claude/commands/work-report.md`（設計師端彙整，PM 日常用不到）。
- 不論工具：切版遵循 `.claude/skills/antd-static-layout/SKILL.md`、互動與 mock 遵循
  `antd-proto-interactions`、每輪改完跑 `antd-verify`（三者實體皆在 `.claude/skills/`）。

## 開工自動流程（session 第一回合必做）

**只要 `input/` 內有檔案（`README.md` 以外），session 第一個回合就主動進入開工流程**，
不必等使用者下指令（使用者送出任一句話即視為啟動——拖資料夾進來只會貼路徑，需按 Enter 送出）：

1. **掃描＋讀取**：讀 `input/` 內**所有**檔案（圖與 md，**數量與種類不限**；略過 `input/README.md` 本身），
   綜合成單一理解，**不假設「一檔＝一頁」**。
2. **分流確認**：先問一句——「偵測到 input/ 有這幾個檔案〈逐一列出〉，這批是要**做新頁面**，
   還是**調整現有某一頁**（哪一頁）？」使用者回覆後才往下：
   - 新頁 → 進對焦環節，走**開工模式**（步驟 0 起）
   - 改頁 → 走**新增/修改模式**，把 `input/` 檔當本輪參考
   - 檔案橫跨多頁 → 請使用者指定先做哪頁／怎麼拆
3. **對焦環節**（新頁）：用幾句話**回述我讀到的理解**（逐一列出各檔角色：流程／規格／視覺參考…），
   讓 PM 抓出誤讀或漏檔；再**只問文件沒交代清楚的缺口**（8 槽位見**開工模式**步驟 0），
   每題附最佳猜測預設、以「選項確認」作答（PM 不必打字）。**每批 ≤5 題、可多批，
   問到 8 槽位無未解為止**——不得以猜測代替提問；未問而自行補上的假設，只能以﹝推測﹞
   標示進步驟 4 的規格確認書，經 PM 同意才算數。
4. **規格確認書**（製作前閘門）：對焦完成後、**正式切版前**，把整份規格整理成一頁摘要——
   8 槽位最終值、所有﹝推測﹞假設、將留 `TODO` 的未定項、預估 token %（基準見〈工具對應〉）——
   以「選項確認」（執行／取消）發問；PM 選「執行」＝**同意這整份規格**，才開始 build；
   取消或提出修正 → 併入理解後重出確認書。**規格再完整都不可省略回述與確認書**（可少問，不可不確認）。

`input/` 空（只剩 `README.md`）時，維持原行為：等使用者貼規格或下指令。
`examples/` 是唯讀品質範例，**不是** PM 頁面、不進分流、不可當修改目標——只在產出時拿來對標完整度。

### `input/` 收件匣定位

- `input/` 是**可拋棄的收件匣**：隨時可清空重放，一次放一頁的材料（多份檔案全部平放即可）。
- **成果與紀錄是「已產出的頁面資料夾」**（如 `BannerManagement/`），不是 `input/`。改頁面時讀
  「已做好的頁面」來改，**不回頭讀當初 input**——所以舊 input 清掉不影響任何已完成頁面。
- `input/` 會進 git，清空後仍可從歷史還原。

## 主流程

1. **準備材料**：把流程圖、規格、參考圖丟進 `input/`（多份檔案、圖或 md 皆可；見「如何準備規格」），
   或整理成一份文字規格
2. **產出 prototype**：把資料夾拖進 Claude Code（或在資料夾內啟動 Codex）、送出任一句話 →
   依「開工自動流程」自動讀 `input/`、分流、對焦，再走**開工模式** build
   （解析 → 建資料夾 → 切版互動 → 驗證 → 交付摘要＋工作紀錄）；
   也可直接貼規格、說「開工」觸發**開工模式**
3. **新增/修改**：同一頁面後續調整，依**新增/修改模式**（自然語說「修改 <頁面>」即可）
4. **每輪驗證**：改完跑 `antd-verify`（靜態），到 0 ERROR
5. **交回設計師 review**：通過後才納入正式專案；轉 Figma 由設計師執行，PM 不碰

> **品質期待**：第一版以「對齊 `examples/` 黃金範例」為目標；若仍不足，用**新增/修改模式**補 1–2 輪即可到位。
> 製作請用**夠強的模型**——Claude Code 用 Opus、Codex 用最高推理檔，模型能力直接影響產出深度。

## 如何準備規格

- 用【規格】／【建議】標記分流：【規格】＝必守的硬需求；【建議】＝可依規範取捨
- 描述清楚 user flow 的狀態與分支（含邊界情境：空狀態、錯誤、載入中）
- 未定的文案／API／常數就直說「待定」，AI 會留 `TODO` 不臆測
- **流程圖可以直接放圖**：把截圖丟進 `input/` 請 AI 讀圖，或用文字把流程描述進規格
- 以上規則對「貼上的規格」與「放進 `input/` 的檔案」都適用

## 產出規範（固定）

- 純 HTML／CSS／JS 靜態頁面，零 React、不建置打包；Ant Design 5 樣式已抽好、直接套
- 需要非 antd 的第三方庫（圖表、地圖等）以 CDN 引入並鎖版本
- 規格未定義的文案／API／常數一律留 `TODO`，不臆測
- **產出完整度對標 `examples/` 黃金範例**：元件註解深度、react-icons 標註、mock 資料真實度、
  CSS／JS 模組化都要達到範例水準，不得產骨架（對標**品質維度**，非照抄版面）
- 詳細切版規則見 `.claude/skills/antd-static-layout`，互動與 mock 見 `antd-proto-interactions`

## 工作紀錄（WORKLOG）

- **目的**：留下每頁的過程數據（問了什麼、猜了什麼、改了幾輪、卡在哪），供設計師彙整成
  工作報告，作為優化 kit 與操作流程的依據。
- **時機與位置**：**開工模式**與**新增/修改模式**的交付摘要步驟，同步把本輪紀錄 append 到
  `<頁面名>/WORKLOG.md`（無檔則建立），依時間序、每輪一個 entry、**每輪 ≤15 行**——
  記重點不記流水帳，這份紀錄本身也要省 token。
- **彙整**：設計師收回成果後說「工作報告」（Claude Code 可用 `/work-report`）→ 依
  `.claude/commands/work-report.md` 掃描各頁 WORKLOG 產出總報告；PM 日常不需執行。

entry 模板（兩種模式）：

```markdown
## <YYYY-MM-DD> 開工（spec-to-proto）
- input：<檔名清單／無（貼規格）>
- 對焦：問 N 題（<題目關鍵字：答案〔PM選／預設／推測〕>…）；回述糾正：<PM 抓出的誤讀／無>
- 確認書：﹝推測﹞X 項、TODO Y 項；PM 確認執行（token 預估 Z%）
- 產出：<檔案數／區塊摘要>
- 驗證：verify <輪數> 輪至 0 ERROR；WARN：<判讀摘要／無>
- TODO 餘留：<清單／無>

## <YYYY-MM-DD> 修改 R<N>（revise）
- 意見 M 條〔視覺 x／互動 x／規格補充 x／bug x／誤解修正 x〕
- 逐條一行：<意見摘要 → 改動>
- 追問：<問了什麼＋答案／無>
- 驗證：<結果>；TODO 餘留：<清單／無>
```

## 資料夾結構

| 資料夾 | 用途 |
|---|---|
| `input/` | **收件匣**：PM 放本次頁面的參考圖／流程圖／規格（數量種類不限、可拋棄、可清空；成果不在這裡） |
| `examples/` | **黃金範例**（品質標竿，只讀）：AI 產新頁前對標其完整度；**PM 勿改勿刪、非產出物、非頁面** |
| `<頁面名>/` | 每個頁面一個資料夾，內部結構依 `antd-static-layout` 第 1 節（`index.html`＋`css/`＋`js/`＋`images/`），另含 `WORKLOG.md` 工作紀錄（見〈工作紀錄〉） |
| `reports/` | **工作報告輸出**（設計師端）：`work-report` 彙整各頁 `WORKLOG.md` 的產出；PM 不需理會 |
| `.claude/skills/` | `antd-static-layout`（切版）、`antd-proto-interactions`（互動與 mock）、`antd-verify`（驗證）——**實體檔案在此** |
| `.agents/skills/` | Codex 的 skills 進入點：**symlink → `.claude/skills`**，兩工具共用同一套內容，勿放實體檔 |
| `.claude/commands/` | **開工模式**（`spec-to-proto`）、**新增/修改模式**（`revise`）、**工作報告**（`work-report`，設計師端）的流程指令（幕後引擎）；Claude Code 走斜線指令，其他工具依〈工具對應〉的「指令路由」讀取同一份檔案 |

## 環境需求

- Claude Code **或** OpenAI Codex CLI 擇一（Codex 建議以 workspace-write 權限模式執行）
- Node.js（僅用於 `node --check` 檢查 JS 語法；驗證腳本 `verify.sh` 是純 bash）
- **不需要 `npm install`、不需要任何建置工具、不需要 Figma**
