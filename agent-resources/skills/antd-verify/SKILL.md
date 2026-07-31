---
name: antd-verify
description: 驗證 EG站後台靜態 prototype 的檔案結構、Ant Design 靜態切版規範、JS 安全模式與需求邊界紀錄。凡新建或修改頁面後必須使用，修正 ERROR 並重跑至通過。
---

# AntD Verify

## 使用者環境邊界

本 skill 是 Agent 內部品質檢查，不是 PM 的操作流程，也不是 prototype 的執行依賴。

- 不得要求 PM 安裝 Node.js、npm 或任何套件。
- 不得要求 PM 開啟終端機或代為執行驗證命令。
- 若 Agent 的執行環境無法使用驗證腳本，必須回報「驗證未完成」並停止宣稱可交付；
  不得把環境準備轉嫁給 PM。

## 固定流程

1. 由 Agent 在自身執行環境執行：

   ```bash
   node agent-resources/skills/antd-verify/scripts/verify.js <頁面資料夾>
   ```

2. ERROR 全部修正；WARN 逐項判斷並在交付摘要說明保留原因。
3. 修改後重跑到 0 ERROR。
4. 由 Agent 對所有修改過的 JS 執行 `node --check <檔案>`。
5. 完成人工邊界覆核後才能交付。

## 人工邊界覆核

- prototype 清楚展示 PM 描述的功能與想法，不因缺少 API 或工程規格而刪減。
- 版型、表單與操作位置符合 `eg-interface-patterns.md` 或使用者提供的既有畫面。
- 沒有 PM 未提到的產品能力、業務流程、權限、審核、匯出、歷程入口或工程例外。
- 框架沒有創造未提供的側欄項目、返回按鈕、麵包屑目的地或其他產品入口。
- 所有可點擊控制項都有展示行為，沒有死按鈕。
- 所有可提交操作具備最小必要輸入；不存在「缺少操作內容卻直接成功」。
- 銀行、國碼、日期、VIP、圖片、金額等欄位符合既有 EG 元件語意。
- 背景 Log、歷程、報表與 API 副作用沒有被自動包裝成可見 UI。
- 合成資料只支援展示，不暗示額外產品規則。
- examples 只影響技術品質，沒有把其額外功能帶入。
- 修改既有頁面時只改受影響區塊。

## 人工切版覆核

- 元件註解包含名稱與關鍵 props。
- icon 註解標示對應 react-icons 名稱。
- DOM 對應 Ant Design 5 實際結構。
- 彈出層位於 `</body>` 前。
- CSS／JS 依區塊拆分，無 inline style/script。
