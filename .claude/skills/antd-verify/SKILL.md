---
name: antd-verify
description: EG站後台靜態 prototype 每輪修改後的驗證（antd-static-layout 規範）。凡產出新頁面、完成一輪修改後必須執行；使用者說「驗證」、「檢查頁面」時亦套用。以腳本檢查違規，依報告修正並重跑至通過。
---

# AntD Verify（每輪修改後驗證，靜態模式）

目的：多輪修改中防止規範劣化（改 B 區塊弄壞 A 區塊、貪快塞 inline style 等）。
掃描交給腳本、判讀交給 Claude。

## 流程（強制）

1. 執行 `bash .claude/skills/antd-verify/scripts/verify.sh <頁面專案資料夾>`
2. 讀取報告：**ERROR 一律修正**；WARN 逐項判斷，保留者在回報中註記原因
3. 修正後**重跑**，直到 0 ERROR
4. 完成人工覆核清單（見下），再向使用者回報驗證摘要

## 檢查項（依據 `antd-static-layout/SKILL.md`）

拆檔結構（index.html／css/antd.css／css/base.css）、head 載入順序、`<style>` 與 inline script、
`style=` 屬性（彈出層 `display:none` 除外）、JS 直接操作 `.style.`、
Tailwind 顏色／圓角／陰影 class 蓋外觀、HTML 內硬編碼色值、圖片路徑、
`window.open`（彈窗一律頁內 Modal）、以 `.hidden=` 切換 `<svg>`（SVGElement 無 .hidden）

## 人工覆核清單（腳本無法檢查）

元件註解（名稱＋關鍵 props）齊全、icon 註解標 react-icons 名稱、共用元件情境已標註、
DOM 對應 antd 5 實際結構、彈出層位於 `</body>` 前、本輪僅動對應區塊檔案

## 判讀注意

- `style="display:none"`（彈出層預設隱藏）不會被列為違規，屬規範允許的取捨
- Tailwind 排版類（flex、grid、gap、w-*、p-*）是允許的；被攔的是顏色／圓角／陰影等外觀類
