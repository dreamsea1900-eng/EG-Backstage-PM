# 修改既有 Prototype 流程（revise）

## 1. 必讀

依序讀取：

1. `agent-resources/skills/prototype-boundary/SKILL.md`
2. 目標頁面的 `SCOPE.md`
3. `agent-resources/skills/antd-static-layout/SKILL.md`
4. `agent-resources/skills/antd-static-layout/references/eg-interface-patterns.md`
5. 本輪涉及互動時讀 `agent-resources/skills/antd-proto-interactions/SKILL.md`

若頁面沒有 `SCOPE.md`，從現有成果與本輪需求補一份簡短邊界即可，不要求追溯歷史來源。

## 2. 逐條解讀

把 PM 意見拆成獨立條目，指出：

- 現有哪個區塊受影響
- 是修 bug、視覺調整、明確新增，還是改變既有範圍
- 使用哪種既有 EG 版型
- 是否需要更新 `SCOPE.md`

只有模糊處會造成核心功能互斥解讀時才追問。呈現方式未指定時，依既有 EG 版型直接決定。

## 3. 修改

- 只讀、只改受影響的小檔。
- 不重寫未變動區塊。
- 不因本輪修改順手新增常見 UX、fallback、狀態或提示。
- 本輪展示內容同步更新簡短 `SCOPE.md`。
- 不要求 API 或工程規格；展示資料可使用中性合成值。

## 4. 驗證與交付

由 Agent 在自身執行環境執行
`node agent-resources/skills/antd-verify/scripts/verify.js <頁面資料夾>` 至 0 ERROR；
修改過的 JS 加跑 `node --check`。PM 不安裝 Node.js、npm，也不執行任何命令。
Agent 環境無法執行時，回報驗證未完成並停止交付，不得要求 PM 補裝工具。

交付摘要簡短列出完成的修改、沿用的 EG 版型、刻意未加入的產品邏輯與 WARN 判讀。

最後 append `WORKLOG.md`：

```markdown
## <YYYY-MM-DD> 修改 R<N>（revise）
- 意見 M 條〔視覺 x／互動 x／規格補充 x／bug x／誤解修正 x〕
- 逐條一行：<意見摘要 → 改動>
- 版型：<沿用／調整的 EG 既有版型>
- 邊界：<刻意未加入的產品邏輯>
- 驗證：<結果>
```
