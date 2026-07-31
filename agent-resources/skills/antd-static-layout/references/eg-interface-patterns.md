# EG 現有介面版型參考

本文件是從既有前端實作抽出的穩定介面慣例，供 prototype 選擇呈現方式。
它回答「這個想法在 EG 通常長什麼樣」，不回答後端如何實作。

來源快照：

- 後台：`web-admin`，React + Ant Design 5。
- 前台：`web-casino-eg`，Next.js + shadcn/ui。
- 抽取日期：2026-07-31。

後台主要抽取位置：

- `src/components/Layout/`：Header、Sider、Content 與 Footer 框架。
- `src/components/ContentTitle/`、`ContentCard/`：頁首與內容容器。
- `src/pages/admin/admin-list/`：搜尋 Card、頁面操作、結果 Card 與 Table。
- `src/pages/admin/admin-create/`：全頁 vertical Form。
- `src/pages/member/single-member-search/`：詳情摘要、操作按鈕與 Modal 表單。
- `src/pages/financial-center/Deposit/SearchForm.tsx`：responsive 搜尋欄位排列。

prototype 製作時以本文件為準，不要求 PM 提供或 Agent 每次重新檢索原始 repo。

## 1. 先分辨介面表面

- EG 後台／營運工具：使用下列 Ant Design 後台版型。
- EG 前台／玩家站：使用 shadcn/ui 與品牌化 responsive 版型，不套後台側欄、搜尋卡與資料表慣例。
- 任務未明說且本 kit 名稱為「EG站後台」時，預設採後台版型。
- 不在同一頁混用 Ant Design 後台與 shadcn 前台兩種視覺語言。

## 2. 後台整體框架

- 桌面操作為主：上方 Header、左側 Sider、中央可捲動 Content、底部版本 Footer。
- Content 外距約 16px。
- 頁首使用約 26px 的主標題；右側可放規格已提到的返回或主要操作。
- 內容以白色 Card 承載，常見陰影；Card body 約為上下 16px、左右 20px。
- 區塊與欄位 gutter 通常為 16px。

### 框架邊界

- Header、Sider 與 Content 可作為視覺外殼，但導覽文字仍是產品內容。
- 沒有現有畫面或 PM 指定時，Sider 只顯示目前所在項目，或直接省略；不得補「會員查詢」
  等看似合理的其他入口。
- 不自行新增麵包屑目的地、返回按鈕、更多操作或無行為的控制項。
- prototype 中所有可點擊按鈕都要有已定義行為；若只是展示，使用非互動文字或明確停用。

## 3. 常見頁面版型

### 查詢／列表頁

依序呈現：

1. Page title。
2. 搜尋 Card。
3. 規格已有的頁面級操作，例如新增。
4. 結果 Card：左側結果標題、右側筆數，內含 bordered Table。

搜尋條件使用 vertical Form 與 responsive grid：

- `lg` 三欄。
- `md` 兩欄。
- `sm` 以下單欄。
- Input、Select、DatePicker 與搜尋按鈕通常使用 large size。
- 搜尋按鈕與欄位同列並佔滿欄寬。

表格欄位過多時使用水平捲動；分頁放在 Table 標準位置。只有 PM 提到的搜尋條件、
欄位、排序與操作才出現，版型本身不會自動增加功能。

### 新增／編輯全頁表單

依序呈現：

1. Page title，可有返回按鈕。
2. 單一主要 Content Card。
3. vertical Form。
4. 規格欄位依語意分組；簡單表單可單欄，較多欄位可用兩欄或三欄 responsive grid。
5. 主要送出按鈕使用 primary、large；既有簡單建立頁常見滿寬按鈕。

### 詳情頁

- 先放摘要 Card：識別資訊、狀態 Tag、規格已有的主要操作。
- 次要資訊使用 Card、description-like key/value 或兩欄 metadata。
- 有明確多組資料時才使用 Tabs；不能只因內容很多就自行新增 Tab。
- 金額或關鍵數值可使用小型 Card 強化層級，但不得創造新指標。

### Modal 表單

- 適合既有頁面上的短操作或少量欄位編輯。
- Modal 通常置中，使用標準 title 與取消／確認 footer。
- 表單採 vertical layout；欄位可在 `sm` 以上兩欄、窄畫面單欄。
- 送出期間由確認按鈕呈現 loading。
- 長流程、大量欄位或需要反覆對照資料時，優先使用全頁表單。

若 PM 已指定全頁、Modal、Drawer 或原地編輯，以 PM 指定為準；未指定時才依上述
既有慣例選擇最小且合理的呈現方式，不需要 PM 再補 UI 規格。

## 4. 常見欄位元件映射

未指定元件時，優先沿用下列 EG 後台語意：

| 資料 | 常見呈現 |
|---|---|
| 銀行帳號 | Input；保留前導零，不用 InputNumber |
| 銀行名稱 | Select／既有 BankSelect，不用自由輸入文字 |
| 國碼＋電話 | 國碼 Select＋電話 Input／既有 PhoneInput |
| VIP 等級 | Select；展示選項不得宣稱是正式常數 |
| 生日／日期 | DatePicker；靜態版可用 `input[type=date]` 模擬 |
| 圖片佐證 | Upload／多檔選擇，檔案留在瀏覽器記憶體 |
| 金額 | InputNumber；靜態版用 number/decimal input 並顯示數值格式 |
| 原因／備註 | TextArea |

### 交易最小表單

既有 `web-admin` 會員錢包操作顯示以下穩定模式：

- 入款／出款：目前餘額、金額、異動後餘額、備註。
- 額度異動：異動類型、金額、流水相關值與備註。

當 PM 只想展示「入款／出款／額度異動」概念時，不需要複製全部工程欄位，但可提交 Modal
至少要有交易類型、金額與備註。若連這些最小內容也無法合理判斷，不能讓確認按鈕直接成功。

## 5. 表單與回饋

- Label 放在控制項上方。
- 必填與格式問題顯示在對應 Form.Item 下方。
- 送出中使用按鈕 loading；整個 Card 初次載入可用 Spin 或 Skeleton。
- 一般結果可使用既有系統的 message／toast，但只展示 PM 想表達的結果。
- 不因真實系統可能失敗，就自動增加網路中斷、重試、回滾、權限或多種錯誤分支。
- prototype 使用本機展示資料即可，不要求 API method、path、request、response 或錯誤碼。

## 6. 前台簡要邊界

前台使用品牌 token、shadcn/ui、responsive layout、Dialog／Sheet 與行動導覽。
只有任務明確是玩家前台時才套用；此時應優先參考該功能附近的前台模式，不把後台
Table、Sider 或 ContentCard 搬入。

目前 kit 的主要交付是 EG 後台 prototype；前台的完整靜態樣式庫與更新機制另案處理。
