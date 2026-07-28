#!/usr/bin/env node
// antd-verify:檢查靜態切版產出是否符合 antd-static-layout 規範(跨平台,Windows/macOS 皆可)
// 用法: node verify.js <頁面專案資料夾>
'use strict'
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('用法: node verify.js <頁面專案資料夾>')
  process.exit(2)
}
const ROOTARG = args[0]
const ROOT = ROOTARG.replace(/[\/\\]+$/, '') || ROOTARG
let stat = null
try { stat = fs.statSync(ROOTARG) } catch (e) { stat = null }
if (!stat || !stat.isDirectory()) {
  console.log('✗ 找不到資料夾: ' + ROOTARG)
  process.exit(2)
}
let err = 0
let warn = 0

// 遞迴列出檔案(跳過 node_modules;排序固定,輸出順序可重現)
function walk(dir, out) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch (e) { return out }
  entries.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0 })
  for (const e of entries) {
    if (e.name === 'node_modules') continue
    const p = dir + '/' + e.name
    if (e.isDirectory()) walk(p, out)
    else if (e.isFile()) out.push(p)
  }
  return out
}
const FILES = walk(ROOT, [])
function filesByExt(ext) { return FILES.filter(function (f) { return f.endsWith(ext) }) }
function readLines(f) {
  try { return fs.readFileSync(f, 'utf8').split('\n') } catch (e) { return [] }
}

// level=ERROR|WARN;每列 hit 格式與 grep -rn 相同:路徑:行號:內容;排除 pattern 比對整列 hit 字串
function scan(level, desc, re, ext, exclude) {
  const hits = []
  for (const f of filesByExt(ext)) {
    const lines = readLines(f)
    for (let i = 0; i < lines.length; i++) {
      if (!re.test(lines[i])) continue
      const rec = f + ':' + (i + 1) + ':' + lines[i]
      if (exclude && exclude.test(rec)) continue
      hits.push(rec)
    }
  }
  if (!hits.length) return
  console.log('\n[' + level + '] ' + desc + '(' + hits.length + ' 處)')
  hits.slice(0, 12).forEach(function (h) { console.log('  ' + h) })
  if (hits.length > 12) console.log('  …其餘 ' + (hits.length - 12) + ' 處省略')
  if (level === 'ERROR') err += hits.length
  else warn += hits.length
}

// svg 的 .hidden 陷阱:HTML 中有 id 的 <svg>,若 JS 以字串引用該 id(或其 '前綴-' 拼接形)
// 且做 .hidden= 賦值 → 無效(SVGElement 無 .hidden 屬性,須 set/removeAttribute;antd-proto-interactions §2)
function scanSvgHidden() {
  const idSet = new Set()
  for (const f of filesByExt('.html')) {
    for (const line of readLines(f)) {
      const re = /<svg[^>]*\sid="([^"]+)"/g
      let m
      while ((m = re.exec(line)) !== null) idSet.add(m[1])
    }
  }
  if (!idSet.size) return
  const hiddenLines = []
  for (const f of filesByExt('.js')) {
    const lines = readLines(f)
    for (let i = 0; i < lines.length; i++) {
      if (/\.hidden\s*=/.test(lines[i])) hiddenLines.push(f + ':' + (i + 1) + ':' + lines[i])
    }
  }
  const all = new Set()
  for (const id of idSet) {
    const base = id.includes('-') ? id.slice(0, id.lastIndexOf('-')) : id
    const prefix = base + '-'
    const needles = ["'" + id + "'", '"' + id + '"', "'" + prefix + "'", '"' + prefix + '"']
    for (const hl of hiddenLines) {
      if (needles.some(function (n) { return hl.includes(n) })) all.add(hl)
    }
  }
  if (!all.size) return
  const sorted = Array.from(all).sort()
  console.log('\n[WARN] 以 .hidden= 切換 <svg>(SVGElement 無 .hidden,須用 set/removeAttribute)(' + sorted.length + ' 處)')
  sorted.slice(0, 12).forEach(function (h) { console.log('  ' + h) })
  warn += sorted.length
}

function pad2(n) { return String(n).padStart(2, '0') }
const now = new Date()
console.log('═══ antd-verify ' + now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()) + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ' ═══')
console.log('目標: ' + ROOTARG)

// ---- 須有 index.html 才可驗證 ----
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.log('✗ 資料夾內沒有 index.html,無可驗證目標')
  process.exit(2)
}

// ---- 結構檢查(antd-static-layout 第1節) ----
for (const f of ['css/antd.css', 'css/base.css']) {
  if (!fs.existsSync(path.join(ROOT, f))) {
    console.log('[ERROR] 缺少 ' + f + '(標準結構,見 antd-static-layout 第1節)')
    err += 1
  }
}

// ---- head 載入順序:Tailwind CDN → antd.css → base.css(第2節) ----
const idxLines = readLines(path.join(ROOT, 'index.html'))
function firstLine(re) {
  for (let i = 0; i < idxLines.length; i++) if (re.test(idxLines[i])) return i + 1
  return 0
}
const t = firstLine(/cdn\.tailwindcss\.com/)
const a = firstLine(/css\/antd\.css/)
const b = firstLine(/css\/base\.css/)
if (t && a && b) {
  if (!(t < a && a < b)) {
    console.log('[ERROR] head 載入順序錯誤(須 Tailwind CDN → antd.css → base.css;目前行號 ' + t + '/' + a + '/' + b + ')')
    err += 1
  }
} else {
  console.log('[WARN] index.html 未同時找到 Tailwind CDN / antd.css / base.css 引用,無法檢查順序')
  warn += 1
}

// ---- 內容檢查 ----
scan('ERROR', '<style> 區塊(CSS 須拆檔至 css/)', /<style/, '.html')
scan('ERROR', 'inline script(JS 須拆檔至 js/)', /<script([^>]*)?>/, '.html', /src=/)
scan('ERROR', 'inline style(禁止;彈出層預設隱藏 display:none 除外)', /style=/, '.html', /display:\s*none/)
scan('ERROR', 'JS 直接操作 .style.(應以 class 切換驅動)', /\.style\./, '.js')
scan('ERROR', 'Tailwind 顏色 class(元件外觀由 antd.css 負責)', /(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+/, '.html')
scan('ERROR', 'Tailwind 圓角/陰影 class(元件外觀由 antd.css 負責)', /(^|["' ])(rounded(-[a-z0-9]+)?|shadow(-[a-z0-9]+)?)(["' ]|$)/, '.html')
scan('WARN', 'HTML 內硬編碼色值(顏色應集中於 css 檔)', /#[0-9a-fA-F]{6}/, '.html')
scan('WARN', 'Tailwind 字級/字重 class(元件文字由 antd.css 負責,版面標籤可例外)', /(^|["' :])(text-(xs|sm|base|lg|xl|2xl)|font-(thin|light|normal|medium|semibold|bold|black))(["' ]|$)/, '.html')
scan('WARN', '圖片未用 images/ 相對路徑', /<img[^>]*src=/, '.html', /src="(images\/|http|data:)/)
scan('WARN', 'window.open(「彈窗」一律頁內 Modal,獨立視窗做法已推翻;見 antd-proto-interactions §3/§7)', /window\.open\s*\(/, '.js')
scanSvgHidden()

console.log('')
console.log('── 結果: ERROR ' + err + ' 處 / WARN ' + warn + ' 處 ──')
console.log('ℹ 靜態人工覆核:元件註解(名稱+關鍵props)齊全、DOM 對應 antd5 實際結構、彈出層位於 </body> 前、本輪僅動對應區塊檔案')
if (err > 0) {
  console.log('✗ 未通過:ERROR 必須修正後重跑')
  process.exit(1)
}
if (warn > 0) {
  console.log('△ 無 ERROR;WARN 請逐項確認')
  process.exit(0)
}
console.log('✓ 通過')
process.exit(0)
