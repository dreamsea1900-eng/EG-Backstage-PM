---
name: antd-static-layout
description: 以純 HTML/CSS/JS(不引入 React)搭配 Ant Design 5 靜態樣式與 Tailwind 建構靜態網頁的切版規範。凡是使用者要求切版、製作靜態頁面、HTML 原型(mockup/prototype)、提到 Ant Design、antd、ant-* class、拆分 html/css/js 檔案、或要求「元件註解對應 AntD 元件樹」時,務必使用本 skill;即使只說「幫我做一個頁面」而未指明技術,只要產出物是靜態網頁也應套用。Use this skill whenever the user asks for static HTML pages, layouts, or prototypes styled with Ant Design (antd) without React.
---

# Ant Design 5 靜態切版規範

目的:產出「外觀 100% 等同 Ant Design 5、但執行階段零 React 依賴」的靜態網頁,
且檔案拆分到讓後續修改只需讀取小檔案,不必讀整份專案。

## 1. 檔案結構(強制)

- HTML、CSS、JS 一律拆成獨立檔案。禁止 inline style 與 inline script。
- CSS 與 JS **依頁面區塊拆多支**(header.css、form.css、header.js、form.js …),
  一個區塊一組檔案。後續修改哪個區塊,就只動那個區塊的檔案。
- 圖片一律放 `images/`,以相對路徑引用。
- 標準結構:

```
project/
├── index.html
├── css/
│   ├── antd.css        ← 由本 skill 的 assets/antd.css 直接複製
│   ├── base.css        ← 全域字型、頁面底色等最小設定
│   ├── header.css
│   └── form.css …
├── js/
│   ├── tailwind-config.js  ← 斷點對齊 FD 規範(固定內容,見第2節)
│   ├── header.js
│   └── form.js …
└── images/
```

## 2. 樣式來源與載入順序(強制)

`assets/antd.css` 是預先用官方 @ant-design/static-style-extract 抽取的
antd 5(抽取當下為 5.29.3)全元件靜態樣式,**已關閉 hash**、
**已補齊預設黑名單的 Modal / Drawer / Popconfirm / Popover / Tooltip / Tour
與 message / notification**。建立專案時直接複製到 `css/antd.css`,不要重寫。

`<head>` 載入順序不可顛倒(讓 antd 元件樣式覆蓋 Tailwind preflight 的 reset):

```html
<script src="https://cdn.tailwindcss.com"></script>  <!-- 1. Tailwind Play CDN -->
<script src="js/tailwind-config.js"></script>         <!-- 2. 斷點對齊(FD 規範) -->
<link rel="stylesheet" href="css/antd.css">           <!-- 3. antd 靜態樣式 -->
<link rel="stylesheet" href="css/base.css">           <!-- 4. 全域設定 -->
<link rel="stylesheet" href="css/header.css">         <!-- 5. 各區塊,依頁面順序 -->
```

`js/tailwind-config.js` 為**固定內容的基礎建設檔**(不受「JS 依區塊拆檔」規則限制),
用途:Tailwind 預設斷點(sm 640 / lg 1024)與 FD/antd 系統(sm 576 / lg 992)不同,
必須覆寫 screens,靜態稿的 `sm:` `md:` `lg:` 響應 class 才會與 FD 規範及 antd.css
內建的 media query 對齊。內容固定如下,建立專案時直接複製:

```js
tailwind.config = {
  theme: {
    screens: {
      xs: '480px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1600px',
    },
  },
}
```

## 3. 技術分工(強制)

- **不引入 React、不引入 antd 的 JS**。頁面是純 HTML/CSS/vanilla JS。
- **Tailwind 只負責排版與間距**:flex、grid、gap、margin、padding、寬高。
  元件外觀(顏色、圓角、字級、陰影、邊框)一律交給 antd.css,
  禁止用 Tailwind 的顏色/圓角/陰影 class 蓋在 ant-* 元件上。
- **只用最基礎、最簡單的 antd 元件**組介面,不做客製化元件、不改 antd 外觀。
- 互動行為(Modal 開關、Tabs 切換、下拉展開)以 vanilla JS 實作,
  寫在對應區塊的 JS 檔中,用 class 切換驅動(如 toggle `ant-modal-open`、
  加減 `ant-tabs-tab-active`),不要用 style 屬性直接改樣式。
- **非 antd 的第三方庫**(圖表 echarts、地圖等)需要時以 **CDN `<script>` 引入並鎖定版本號**
  (如 `https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js`),
  不建置 npm/打包環境;放在 `</body>` 前、該區塊 JS 檔之前載入。

## 4. HTML 結構要求(強制)

- HTML 巢狀層級必須對應 **Ant Design 5 實際渲染出的 DOM 結構**
  (component hierarchy),不可自創層級。
- class 一律使用 antd 原生 class(ant-btn、ant-input、ant-form-item …),
  **禁止用自訂 class 取代 antd 元件名稱**;需要掛排版用的 Tailwind class
  可以並列,但 ant-* class 必須完整保留,antd.css 才套得上。
- **新版 antd 5 variant class(強制;本專案 antd.css 抽自 5.29.3,約 v5.21 起樣式拆分)**:
  只寫 `ant-btn ant-btn-primary` 不會有外觀,必須加 color＋variant class——
  - primary 實心:`ant-btn ant-btn-primary ant-btn-color-primary ant-btn-variant-solid`
  - default:`ant-btn ant-btn-color-default ant-btn-variant-outlined`
  - text:`ant-btn ant-btn-color-default ant-btn-variant-text`;
    link:`ant-btn ant-btn-color-link ant-btn-variant-link`;ghost 另保留 `ant-btn-background-ghost`
  - Input／affix-wrapper **必須加 `ant-input-outlined`** 才有邊框
  - 抽出的 antd.css **不含 Space 元件樣式**,用到 `Space`/`Space.Compact` 時
    在專案 css 補 flex 佈局(不手改 antd.css)
- **每個元件用 HTML 註解標出「元件名稱 + 關鍵 props」**,放在元件外層標籤正上方:

```html
<!-- Button type="primary" size="large" -->
<button type="button" class="ant-btn ant-btn-primary ant-btn-color-primary ant-btn-variant-solid ant-btn-lg">
  <span>送出</span>
</button>

<!-- Form.Item label="帳號" required -->
<div class="ant-form-item">
  <div class="ant-row ant-form-item-row">
    <div class="ant-col ant-form-item-label">
      <label class="ant-form-item-required" for="account">帳號</label>
    </div>
    <div class="ant-col ant-form-item-control">
      <div class="ant-form-item-control-input">
        <div class="ant-form-item-control-input-content">
          <!-- Input placeholder="請輸入帳號" -->
          <input id="account" class="ant-input ant-input-outlined" placeholder="請輸入帳號">
        </div>
      </div>
    </div>
  </div>
</div>
```

- 不確定某元件的 DOM 結構時,以 antd 5 官方文件示範的實際渲染結果為準,
  寧可查證也不要憑印象自創。
- SVG 圖示直接內嵌,並於註解標對應的 react-icons 名稱(FD 端只用 react-icons v5、
  禁 @ant-design/icons,標好名稱轉 TSX 才接得上):`<!-- icon: FiSearch (react-icons/fi) -->`
- 情境符合 FD 既有共用元件(清單:`.claude/skills/antd-tsx-prototype/data/shared-components.md`)時,
  元件註解改標共用元件名:`<!-- 共用元件: GameSelector -->`;FD 會以現成元件銜接,
  視覺模擬即可,不必精刻其內部結構。

## 5. 彈出類元件的注意事項

Modal、Drawer、Select 下拉、Tooltip 這類元件在真 antd 中是執行時掛到
body 的 portal。靜態版做法:

- 把彈出層的完整 DOM(含 `ant-modal-root`、`ant-modal-mask`、
  `ant-modal-wrap` 等外層)直接寫在 `</body>` 前,預設加 `display:none`
  或對應的隱藏 class,由該區塊的 JS 切換顯示。
- 彈出定位不會像真 antd 自動計算,固定版位即可;這是靜態切版的已知取捨。
- 鍵盤操作與 aria 屬性不會自動存在,若使用者要求無障礙,需在 JS 中補上。

## 6. 重抽樣式 / 更換主題(需要時才做)

> ⚠ 本專案主題**維持 antd v5 預設**(primary #1677ff 等,FD 規範要求與現有系統一致),
> 不要為個別頁面改主題;未來若整體品牌化,先與 FD 對齊再重抽。

只有兩種情況需要跑 `scripts/extract.mjs`:antd 要升版,或(與 FD 對齊後)要改主題
(如品牌色)。做法:

```bash
cd scripts
npm install
node extract.mjs ../assets/antd.css
```

改主題:編輯 extract.mjs 內 `theme.token`(例 `colorPrimary`)後重跑。
腳本已處理 hash 關閉與黑名單元件補渲染,勿刪除相關段落。

## 7. 修改原則

- 後續修改只調整對應區塊的 html 片段 / css / js 檔,不重寫整份專案、
  不重新輸出未變動的檔案。
- 新增區塊 = 新增一組同名的 css + js 檔,並在 index.html 的 head 依序掛上。
