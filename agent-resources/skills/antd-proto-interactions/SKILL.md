---
name: antd-proto-interactions
description: 為 PM 想展示的 EG站後台 prototype 實作最短 vanilla JS 互動、Modal、toast、loading 與展示狀態；依既有介面習慣呈現，但不得以 demo 完整度為由新增產品邏輯或控制項。
---

# AntD Prototype 互動規範

`antd-static-layout` 管 DOM／CSS，本 skill 只實作 PM 想展示所需的最短行為。
開始前先讀 `../prototype-boundary/SKILL.md`、layout skill 的
`references/eg-interface-patterns.md` 與目標頁面的簡短 `SCOPE.md`。

## 1. 不得自動補互動

PM 沒提到、且不是完成指定展示流程所必需時，不加入：

- Modal、Drawer、確認視窗、toast 或 notification。
- loading、empty、error、success、無權限等產品狀態。
- localStorage、sessionStorage、重設 Demo 資料。
- 成功／錯誤結果切換器、Demo Radio 或 mock API 分支。
- 刪除確認、補償、fallback、重試或自動 reload。

規格只說「失敗顯示對應錯誤」但未定義呈現與文案時，保留 `TODO`，不要建立多種錯誤介面。

所有非 disabled 的按鈕必須有實際展示行為。不得加入沒有事件、導覽或提交效果的返回、
更多操作或功能入口。

## 2. Mock 原則

- mock 只覆蓋展示想法所需的資料與分支。
- 不以「像真的」為由創造未定義欄位、角色、錯誤碼或業務狀態。
- 動態值由 mock 帶入，不硬編碼成看似正式的產品常數。
- 送出效果可用短暫 `setTimeout` 表現，不需要 API method、path、request 或 response。
- 若規格未要求跨重整保存，狀態只保存在記憶體。
- Demo 專用控制項只有 PM 明確核准時才能加入，並標記「轉 Figma 時忽略」。

## 2.1 最小完整操作

- 送出前確認畫面具備完成該動作的最小必要輸入。
- PM 未列 UI 欄位時，查 `eg-interface-patterns.md` 的同類既有模式。
- 採用既有模式補入的必要欄位必須記入 `SCOPE.md` 的「展示假設」。
- 沒有可靠模式時，操作保持靜態或 disabled，不得點擊後直接顯示成功。
- 背景 Log、歷程、報表或 API 結果不顯示在 UI，除非它影響操作者當下決策。

## 3. 狀態渲染

- 核准狀態的 DOM 預寫在 HTML，JS 只切換 `hidden`、文字與語意 class。
- 不動態建立產品 UI，避免 DOM 與設計交付不一致。
- `<svg>` 顯示切換使用 `setAttribute('hidden','')`／`removeAttribute('hidden')`；
  不使用 `.hidden=`。
- antd 元件 display 規則蓋過 `hidden` 時，在專案 CSS 補明確選擇器。

## 4. Modal

PM 已指定 Modal 時照做；未指定呈現方式時，可依 `eg-interface-patterns.md` 判斷少量、
就地編輯是否適合使用既有 Modal 表單模式。這是版型選擇，不是新增產品功能。

- 結構置於 `</body>` 前：
  `ant-modal-root > ant-modal-mask + ant-modal-wrap > ant-modal > ant-modal-content`。
- 使用 class 開關，不直接操作 `.style`。
- 關閉鈕、mask、Esc 是否存在及其行為，以規格為準；未定義時只實作 Ant Design
  基本關閉行為，不附加產品副作用。
- 送出期間若規格要求防重複，使用 `disabled` 與 `ant-btn-loading`。

可從 `assets/modal.*` 複製結構，但模板只能提供技術骨架，不能帶入模板文案或流程。

## 5. Toast 與 loading

- 只有規格已定義提示時才使用 toast；文案未定寫 `TODO`。
- 同時只顯示一種已核准的 notice。
- loading 只限縮在觸發中的按鈕／區塊，不自行擴張成全頁鎖定。
- 不因成功就自動 reload；只有規格明確要求時才做。

可從 `assets/toast.*` 複製技術結構，刪除未核准的 notice type。

## 6. 檔案與驗證

- 互動 JS、Modal、toast 依區塊拆檔。
- 每新增一個展示狀態或分支，確認它確實服務 PM 想展示的內容，並簡短記入 `SCOPE.md`。
- 互動由 `index.html` 以 `<script src>` 載入 vanilla JavaScript；不得要求 build 或本機 server。
- 每輪由 Agent 執行 `../antd-verify/scripts/verify.js` 到 0 ERROR；修改過的 JS
  加跑 `node --check`。這些是 Agent 內部檢查，不得要求 PM 安裝 Node.js 或執行命令。
