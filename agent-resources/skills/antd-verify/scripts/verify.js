#!/usr/bin/env node
// antd-verify:檢查靜態切版產出是否符合共用 prototype 規範(跨平台,Windows/macOS 皆可)
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

function warnRecords(desc, records) {
  if (!records.length) return
  console.log('\n[WARN] ' + desc + '(' + records.length + ' 處)')
  records.slice(0, 12).forEach(function (record) { console.log('  ' + record) })
  if (records.length > 12) console.log('  …其餘 ' + (records.length - 12) + ' 處省略')
  warn += records.length
}

// type=button 若沒有可供 JS 綁定的識別、disabled 或 inline handler，通常是無行為的死按鈕。
function scanUnwiredButtons() {
  const records = []
  for (const f of filesByExt('.html')) {
    const html = readLines(f).join('\n')
    const re = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi
    let match
    while ((match = re.exec(html)) !== null) {
      const attrs = match[1]
      if (!/\btype=["']button["']/i.test(attrs)) continue
      if (/\b(id|data-[\w-]+|onclick)=/i.test(attrs) || /\bdisabled\b/i.test(attrs)) continue
      const text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '(無文字)'
      const line = html.slice(0, match.index).split('\n').length
      records.push(f + ':' + line + ':<' + text + '>')
    }
  }
  warnRecords('type=button 可能沒有展示行為(補事件、導覽或 disabled)', records)
}

function scanNavigationFantasy() {
  const records = []
  for (const f of filesByExt('.html')) {
    const lines = readLines(f)
    for (let i = 0; i < lines.length; i++) {
      if (!/\bnav-item\b/.test(lines[i]) || /\bnav-item-active\b/.test(lines[i])) continue
      records.push(f + ':' + (i + 1) + ':' + lines[i])
    }
  }
  warnRecords('非目前頁的導覽項目需由 PM 或既有畫面證明', records)
}

function scanFieldSemantics() {
  const records = []
  const rules = [
    { label: '銀行名稱', expected: 'select' },
    { label: '國碼', expected: 'select' },
  ]
  for (const f of filesByExt('.html')) {
    const html = readLines(f).join('\n')
    for (const rule of rules) {
      const labelRe = new RegExp(`<label[^>]*for=["']([^"']+)["'][^>]*>[^<]*${rule.label}[^<]*<\\/label>`, 'i')
      const labelMatch = html.match(labelRe)
      if (!labelMatch) continue
      const id = labelMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const controlRe = new RegExp(`<([a-z0-9-]+)[^>]*id=["']${id}["']`, 'i')
      const controlMatch = html.match(controlRe)
      if (controlMatch && controlMatch[1].toLowerCase() !== rule.expected) {
        const line = html.slice(0, labelMatch.index).split('\n').length
        records.push(f + ':' + line + ':' + rule.label + ' 使用 <' + controlMatch[1] + '>，EG 既有模式預期 <' + rule.expected + '>')
      }
    }
  }
  warnRecords('欄位元件與 EG 既有語意不一致', records)
}

function scanTransactionMinimum() {
  const records = []
  for (const f of filesByExt('.html')) {
    const html = readLines(f).join('\n')
    const modalStart = html.search(/id=["']transaction-modal["']/i)
    if (modalStart < 0) continue
    const modalHtml = html.slice(modalStart)
    if (!/(確認|送出)/.test(modalHtml)) continue
    if (/(金額|amount|inputmode=["']decimal["']|type=["']number["'])/i.test(modalHtml)) continue
    const line = html.slice(0, modalStart).split('\n').length
    records.push(f + ':' + line + ':交易 Modal 有確認操作，但未找到金額或其他交易內容')
  }
  warnRecords('可提交交易缺少最小完整輸入', records)
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
for (const f of ['SCOPE.md', 'WORKLOG.md', 'css/antd.css', 'css/base.css']) {
  if (!fs.existsSync(path.join(ROOT, f))) {
    console.log('[ERROR] 缺少 ' + f + '(標準結構,見 antd-static-layout 第1節)')
    err += 1
  }
}

// ---- SCOPE 簡短邊界結構檢查(prototype-boundary) ----
const scopeLines = readLines(path.join(ROOT, 'SCOPE.md'))
for (const heading of ['## 要展示的內容', '## 採用的既有版型', '## 展示互動', '## 刻意不加入', '## 展示假設']) {
  if (!scopeLines.some(function (line) { return line.trim() === heading })) {
    console.log('[ERROR] SCOPE.md 缺少必要段落: ' + heading)
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
scan('WARN', '使用持久化或 Demo 控制(通常不應出現在 PM prototype)', /(localStorage|sessionStorage|重設 Demo|Demo：)/, '.js')
scan('WARN', 'HTML 含 Demo 控制(通常不應出現在 PM prototype)', /(重設 Demo|Demo：)/, '.html')
scan('WARN', '背景副作用被顯示在介面(確認是否真的影響操作者判斷)', /(成功後|送出後|儲存後).*(Log|歷程|報表|API|開分洗分|回滾|補償)/i, '.html')
scanSvgHidden()
scanUnwiredButtons()
scanNavigationFantasy()
scanFieldSemantics()
scanTransactionMinimum()

console.log('')
console.log('── 結果: ERROR ' + err + ' 處 / WARN ' + warn + ' 處 ──')
console.log('ℹ 人工覆核:符合 PM 展示意圖與 EG 既有版型、無額外產品邏輯、元件註解齊全、DOM 對應 antd5、彈出層位於 </body> 前')
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
