---
name: antd-verify
description: EG站後台產出物的每輪修改後驗證，支援雙模式——靜態 HTML（antd-static-layout 規範）與 TSX（antd-tsx-prototype／FD 規範），依資料夾內容自動偵測。凡產出新頁面、完成一輪修改、或 TSX 交付前必須執行；使用者說「驗證」、「檢查頁面」時亦套用。以腳本檢查違規，依報告修正並重跑至通過。
---

# AntD Verify（每輪修改後驗證，靜態／TSX 雙模式）

目的：多輪修改中防止規範劣化（改 B 區塊弄壞 A 區塊、貪快塞 inline style、TSX 混入 v4 寫法等）。
掃描交給腳本、判讀交給 Claude。

## 流程（強制）

1. 執行 `bash .claude/skills/antd-verify/scripts/verify.sh <頁面專案資料夾>`
   - 資料夾含 `index.html` → 跑靜態檢查；含 `.tsx` → 跑 TSX 檢查；兩者並存就都跑
2. 讀取報告：**ERROR 一律修正**；WARN 逐項判斷，保留者在回報中註記原因
3. 修正後**重跑**，直到 0 ERROR
4. 完成對應模式的人工覆核清單（見下），再向使用者回報驗證摘要

## 檢查項

**靜態模式**（依據 `antd-static-layout/SKILL.md`）：
拆檔結構（index.html／css/antd.css／css/base.css）、head 載入順序、`<style>` 與 inline script、
`style=` 屬性（彈出層 `display:none` 除外）、JS 直接操作 `.style.`、
Tailwind 顏色／圓角／陰影 class 蓋外觀、HTML 內硬編碼色值、圖片路徑

**TSX 模式**（依據 `antd-tsx-prototype/SKILL.md`＝FD 規範）：
`visible=`（v4 API）、moment、ProComponents、`@ant-design/icons`、`any` 型別、
硬寫中文（純註解行已排除）、FD 5 色 token 以外的 hex 色碼

## 人工覆核清單（腳本無法檢查）

**靜態**：元件註解（名稱＋關鍵 props）齊全、icon 註解標 react-icons 名稱、共用元件情境已標註、
DOM 對應 antd 5 實際結構、彈出層位於 `</body>` 前、本輪僅動對應區塊檔案

**TSX**：`index.tsx` 無業務邏輯（Controller 分離）、`types.ts` 型別完整、
i18n key 對照表已附於交付說明、共用元件「沿用／新建」已標註、RWD 用 antd Grid props（FD 斷點）

## 判讀注意

- `style="display:none"`（彈出層預設隱藏）不會被列為違規，屬規範允許的取捨
- Tailwind 排版類（flex、grid、gap、w-*、p-*）是允許的；被攔的是顏色／圓角／陰影等外觀類
- TSX 的中文檢查會剝除所有註解（`//` 行註解、`/* */` 區塊含跨行、`{/* */}` JSX 註解）後才比對，行首／行尾註解含中文皆不誤報；被列出的一定是註解外的顯示文字
- TSX 的 `visible=` 若非 antd 元件 prop（罕見）可視為誤報，註記後保留
