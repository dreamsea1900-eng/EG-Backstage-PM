---
description: 處理一輪 PM 修改意見（EG站後台多輪修改儀式：解讀→只讀小檔→修改→驗證→沉澱→摘要）
argument-hint: <頁面資料夾（可省略）> <PM 修改意見>
---

處理本輪 PM 修改意見。目標頁面與意見內容：

$ARGUMENTS

依下列固定步驟執行（EG站後台多輪修改儀式）：

1. **讀規則**：讀 `doc/decisions.md`（僅此檔），已沉澱規則直接遵循、被標註推翻的不再沿用。
   目標頁面未指明時，從意見內容或最近工作的頁面推斷；推斷不出來列入步驟 2 一併問。
2. **逐條解讀**：把意見拆成獨立條目，逐條寫出理解與影響的區塊。
   模糊詞先對照 decisions.md 既有解讀（例：「彈窗」＝頁內 antd Modal、「美化」＝規範內打磨不套 frontend-design）。
   仍不確定的**一次問完**，不要邊做邊問；意見可能是在回報 bug（如「icon 沒帶入」），先查根因再定改法。
3. **只讀受影響小檔**：依 `antd-static-layout` 第 7 節，只讀對應區塊的 html 區段／css／js 檔；
   已在 context 的檔案不重讀，以最省 token 的方式定位。
4. **計畫確認**：依全域規範列計畫＋預估 token %，AskUserQuestion（執行／取消）確認後才動手。
5. **修改**：切版遵循 `antd-static-layout`、互動與 mock 遵循 `antd-proto-interactions`；
   規格未定義處留 `TODO` 不臆測；只動對應區塊檔案，不重寫整份專案。
6. **驗證**：`bash .claude/skills/antd-verify/scripts/verify.sh <頁面資料夾>` 跑到 0 ERROR／判讀 WARN；
   動過 JS 加跑 `node --check`。
7. **沉澱**：逐條判斷是否「通則」→ 追加 `doc/decisions.md`；
   同一規則**第二次**出現 → 回寫 `antd-static-layout`／`antd-proto-interactions`／專案 CLAUDE.md 並標記「已回寫」；
   被本輪推翻的舊規則要就地標註推翻，不留誤導。
8. **交付摘要**（固定格式）：逐條對應意見說明改了什麼、異動檔案清單、驗證結果、
   本輪沉澱／回寫了什麼、剩餘 TODO。
