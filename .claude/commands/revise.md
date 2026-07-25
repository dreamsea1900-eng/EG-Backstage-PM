---
description: 新增/修改模式——處理一輪 PM 修改意見（EG站後台：解讀→只讀小檔→製作前 token% 確認→修改→驗證→摘要）
argument-hint: <頁面資料夾（可省略）> <PM 修改意見>
---

處理本輪 PM 修改意見。目標頁面與意見內容：

$ARGUMENTS

（若本輪參考檔放在 `input/`，一併讀取作為修改依據；改頁面以「已做好的頁面」為準，不回頭重讀當初建頁的 input。）

依下列固定步驟執行（EG站後台**新增/修改模式**）：

1. **逐條解讀**：把意見拆成獨立條目，逐條寫出理解與影響的區塊。
   目標頁面未指明時，從意見內容或最近工作的頁面推斷；推斷不出來一併問。
   模糊詞先對照專案慣例（例：「彈窗」＝頁內 antd Modal、「美化」＝規範內打磨、不套 frontend-design）。
   仍不確定的**一次問完**，不要邊做邊問；意見可能是在回報 bug（如「icon 沒帶入」），先查根因再定改法。
2. **只讀受影響小檔**：依 `antd-static-layout` 第 7 節，只讀對應區塊的 html 區段／css／js 檔；
   已在 context 的檔案不重讀，以最省 token 的方式定位。
3. **計畫確認**：依全域規範列計畫＋預估 token %，AskUserQuestion（執行／取消）確認後才動手。
4. **修改**：切版遵循 `antd-static-layout`、互動與 mock 遵循 `antd-proto-interactions`；
   規格未定義處留 `TODO` 不臆測；只動對應區塊檔案，不重寫整份專案；完整度比照 `examples/` 黃金範例。
5. **驗證**：`bash .claude/skills/antd-verify/scripts/verify.sh <頁面資料夾>` 跑到 0 ERROR／判讀 WARN；
   動過 JS 加跑 `node --check`。
6. **交付摘要**（固定格式）：逐條對應意見說明改了什麼、異動檔案清單、驗證結果、剩餘 TODO；
   若有用到 `input/` 參考檔，附註本輪依據了哪些檔。
