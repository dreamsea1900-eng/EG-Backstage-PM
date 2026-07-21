---
name: antd-proto-interactions
description: EG站後台靜態 prototype 的互動與 mock 慣例（demo 狀態、Modal、toast、loading、mock API 分支、顯示切換）。凡是為 antd-static-layout 切版頁面加入互動邏輯、demo 假資料、彈窗、訊息提示、載入狀態、模擬 API 流程時，務必與 antd-static-layout 一併套用本 skill（切版歸該 skill、互動歸本 skill）。Use this skill whenever adding interactions, mock data/state, modals, toasts, or loading states to static antd prototype pages.
---

# AntD Prototype 互動慣例（EG站後台）

定位：`antd-static-layout` 管切版（DOM／CSS／拆檔），本 skill 管**互動與 mock**。
本 skill 是 `doc/decisions.md` 互動類通則的回寫落腳處。
最終出口是 Figma 設計稿：**demo 專用的頁面、控制項、區塊一律在註解標記「轉 Figma 時忽略」**。

**模板（省 token，優先複製再改，不重新生成）**：`assets/` 內含
`toast.js`＋`toast.html`＋`toast.css`（§6）、`modal.html`＋`modal.css`（§3）、
`demo-radio.html`＋`demo-radio.js`（§4）——複製到頁面對應位置後，
把 `xxx`／`Xxx` 佔位前綴改為頁面前綴（如 `tpb`／`Tpb`）、`TODO` 換成規格內容即可。

## 1. Demo 狀態（mock 資料）

- 頁面級 mock 狀態存 localStorage，key 命名 `eg<PascalCase頁面名>.demo`
- 讀取函式固定寫法：`try { JSON.parse(...) } catch` ＋ 型別／白名單過濾，資料毀損視同未初始化回 `DEFAULT_*` 常數；常數旁註記 `TODO: 實際由 <API> 帶入`
- 資料結構對齊規格的 API 契約（如 `{provider, maskedAccount, boundAt}`），方便日後對接
- 頁尾置中一顆 `Button type="link"`「重設 Demo 資料」：清 localStorage ＋ reload，註記「轉 Figma 時忽略」
- **跨重整的一次性狀態**（如重整後新項目短暫高亮）用 sessionStorage：讀後立即刪除、`try-catch` 失敗不阻斷主流程

## 2. 渲染與顯示切換

- **所有狀態的 DOM 預寫在 HTML**，JS 只切換顯示／文字／class，不動態建 DOM（利於轉 Figma 與人工檢視）
- 顯示切換用 `hidden` 屬性或語意 class；antd 元件自帶 display 規則時，專案 css 補
  `.ant-btn[hidden]{display:none}` 這類規則確保蓋過
- **`<svg>` 是 SVGElement，沒有 JS `.hidden` 屬性**——切換 svg 顯示一律
  `setAttribute('hidden','')`／`removeAttribute('hidden')`，並在 css 補 `svg[hidden]{display:none}`
- 清單型功能列採「支援項目 × 狀態」**合併固定渲染**：所有列恆在，依狀態切換列內按鈕與副標，
  不做空狀態（除非規格另有定義）

## 3. 頁內 Modal（彈窗）

- **語彙：PM／使用者說「彈窗」＝頁內 antd Modal**，不是 `window.open`（瀏覽器視窗呈整頁觀感，已被推翻）；
  站外頁（三方 OAuth 等）在 prototype 中也一律用頁內 Modal 模擬
- DOM 結構置於 `</body>` 前：
  `ant-modal-root > ant-modal-mask ＋ ant-modal-wrap(role="dialog") > ant-modal > ant-modal-content`，
  關閉鈕用官方 CloseOutlined svg；寬度／`top:100px` 在專案 css 設定
- 開關以 class 切換（`.xxx-modal.xxx-modal-open{display:block}`），不用 inline style、JS 不操作 `.style`
- **取消三件套**＝關閉鈕、點 mask 外側（`e.target === wrap`）、Esc，皆為「取消／靜默中止」語意，行為一致
- **送出中鎖定**：主按鈕轉 loading 期間，取消三件套與重複點擊一律忽略，防重複觸發

## 4. mock API 與 demo 分支

- API 模擬用 `setTimeout`（約 600ms，必要時包 Promise），函式註記 `TODO: 對接 <method> <path>`
- 多分支結果（成功／特定錯誤／一般錯誤）用 **demo Radio 區塊**選擇：置於設計內容之後、
  上緣分隔線＋12px 次要色小標「Demo：模擬○○結果」，註記「轉 Figma 時忽略」
- 靜態 Radio 需 JS 於 change 時同步切 `ant-radio-checked`／`ant-radio-wrapper-checked` class
- 錯誤碼等動態值由 mock 帶入 toast／文案，**前端不寫死**（對齊規格慣例）

## 5. 按鈕 loading

- loading ＝ `disabled` ＋ `ant-btn-loading` class ＋ icon 對調（原 icon `hidden`、spinner 顯示）；
  spinner 用官方 LoadingOutlined path，旋轉動畫在專案 css 自帶 keyframes（抽出的 antd.css 不含）
- 清單列內操作的 loading／disabled **限縮在觸發列**，其他列維持可用；
  流程進行中觸發他列＝前一流程靜默中止（全頁行為保持一致）

## 6. message toast

- 靜態 `ant-message` 結構預寫各型別 notice（success／error…），同時僅顯示一種；
  刪減型別時 HTML 與 toast 控制器的 `TYPES` 要同步
- 控制器模式：`XxxToast.show(type, text, duration)`——`text` 為 null 沿用 HTML 預設文案、
  `duration` 預設 3000ms、傳 0 不自動關閉（由呼叫端收尾）
- 成功後要重整的流程：toast 用 `duration 0`，**先讓 toast 可見約 1.5–3 秒再 reload**

## 7. 直接生效的狀態操作

- demo 中列的狀態操作（如解除綁定）點擊**直接生效、就地重繪**（改 mock 資料 → `renderList()`），
  不重整、不要求使用者走「重設 Demo 資料」
- 規格未定義確認流程／成功提示時：先做直接生效並留 TODO，不臆測加確認彈窗

## 8. 檔案落點與驗證

- 互動 JS 依區塊拆檔（`js/<區塊>.js`）；彈窗、toast 等共用機制各自成檔；css 同理（如 `css/modal.css`）
- 每輪改完：`antd-verify`（靜態模式）跑到 0 ERROR，動過的 JS 加跑 `node --check`
