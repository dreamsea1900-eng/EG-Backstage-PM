// smoke.js:靜態頁面 JS 執行期冒煙測試(補 node --check 抓不到的 ReferenceError/TypeError)
// 用法: NODE_PATH=<裝了 jsdom 的 node_modules> node smoke.js <頁面資料夾>
// 做法:載入 index.html → 依序注入 js/*.js → 點擊所有 button → 捕捉載入期與點擊期執行錯誤
const fs = require('fs')
const path = require('path')

const ROOT = process.argv[2]
if (!ROOT) { console.log('用法: node smoke.js <頁面資料夾>'); process.exit(2) }
const indexPath = path.join(ROOT, 'index.html')
if (!fs.existsSync(indexPath)) { console.log('smoke: 無 index.html,跳過'); process.exit(0) }

let JSDOM
try { ({ JSDOM } = require('jsdom')) }
catch (e) { console.log('ℹ smoke 跳過:未安裝 jsdom(於專案根 npm i -D jsdom 可啟用)'); process.exit(0) }

const errors = []
process.on('uncaughtException', (e) => errors.push('非同步錯誤: ' + e.message))

const dom = new JSDOM(fs.readFileSync(indexPath, 'utf8'), { runScripts: 'outside-only', pretendToBeVisual: true })
const { window } = dom
const d = window.document
window.addEventListener('error', (e) => errors.push('window.error: ' + (e.message || e.error)))

// 預置 CDN 提供的全域(smoke 不載入外部 CDN),避免 tailwind-config.js 等設定檔誤報
window.tailwind = window.tailwind || { config: {} }

// 依 index.html 裡的 <script src> 順序注入(與瀏覽器一致)
const srcs = [...d.querySelectorAll('script[src]')].map((s) => s.getAttribute('src'))
for (const src of srcs) {
  const p = path.join(ROOT, src)
  if (!fs.existsSync(p)) continue // 外部 CDN 略過
  try { window.eval(fs.readFileSync(p, 'utf8')) }
  catch (e) { errors.push('載入 ' + src + ' 崩潰: ' + e.message) }
}

const wait = (ms) => new Promise((r) => window.setTimeout(r, ms))

;(async () => {
  // 點擊所有 button,捕捉同步執行期錯誤(如 open() 內的 ReferenceError)
  const btns = [...d.querySelectorAll('button')]
  for (const b of btns) {
    const label = b.id || (b.textContent || '').trim().slice(0, 12) || 'button'
    try { b.click(); await wait(30) }
    catch (e) { errors.push('點擊 <' + label + '> 崩潰: ' + e.message) }
  }
  await wait(600) // 等 mock 非同步(setTimeout/.then)裡的錯誤浮現

  if (errors.length) {
    console.log('✗ smoke 發現執行期錯誤(' + errors.length + '):')
    errors.forEach((e) => console.log('  - ' + e))
    process.exit(1)
  }
  console.log('✓ smoke:載入 + 點擊 ' + btns.length + ' 個 button,無執行期錯誤')
  process.exit(0)
})()
