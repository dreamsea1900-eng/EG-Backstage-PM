#!/bin/bash
# antd-verify:檢查靜態切版產出是否符合 antd-static-layout 規範
# 用法: bash verify.sh <頁面專案資料夾>
set -u
export LC_ALL=en_US.UTF-8
if [ $# -eq 0 ]; then echo "用法: bash verify.sh <頁面專案資料夾>"; exit 2; fi
ROOT="$1"
if [ ! -d "$ROOT" ]; then echo "✗ 找不到資料夾: $ROOT"; exit 2; fi
err=0; warn=0

scan() { # $1=級別 $2=說明 $3=pattern $4=include [$5=排除pattern]
  local hits
  hits=$(grep -rnE --include="$4" "$3" "$ROOT" 2>/dev/null || true)
  if [ -n "${5:-}" ] && [ -n "$hits" ]; then hits=$(printf '%s\n' "$hits" | grep -vE "$5" || true); fi
  [ -z "$hits" ] && return 0
  local n; n=$(printf '%s\n' "$hits" | wc -l | tr -d ' ')
  printf '\n[%s] %s(%s 處)\n' "$1" "$2" "$n"
  printf '%s\n' "$hits" | head -12 | sed 's/^/  /'
  [ "$n" -gt 12 ] && echo "  …其餘 $((n-12)) 處省略"
  if [ "$1" = "ERROR" ]; then err=$((err+n)); else warn=$((warn+n)); fi
  return 0
}

# svg 的 .hidden 陷阱:HTML 中有 id 的 <svg>,若 JS 同行以字串引用該 id(或其 '前綴-' 拼接形)
# 且做 .hidden= 賦值 → 無效(SVGElement 無 .hidden 屬性,須 set/removeAttribute;antd-proto-interactions §2)
scan_svg_hidden() {
  local ids id prefix hits all n
  ids=$(grep -rhoE '<svg[^>]*[[:space:]]id="[^"]+"' --include='*.html' "$ROOT" 2>/dev/null | sed -E 's/.*id="([^"]+)".*/\1/' | sort -u)
  [ -z "$ids" ] && return 0
  all=""
  while IFS= read -r id; do
    prefix="${id%-*}-"
    hits=$(grep -rnE --include='*.js' '\.hidden[[:space:]]*=' "$ROOT" 2>/dev/null | grep -F -e "'$id'" -e "\"$id\"" -e "'$prefix'" -e "\"$prefix\"" || true)
    [ -n "$hits" ] && all="${all}${hits}
"
  done <<< "$ids"
  all=$(printf '%s' "$all" | grep -v '^$' | sort -u || true)
  [ -z "$all" ] && return 0
  n=$(printf '%s\n' "$all" | wc -l | tr -d ' ')
  printf '\n[WARN] %s(%s 處)\n' "以 .hidden= 切換 <svg>(SVGElement 無 .hidden,須用 set/removeAttribute)" "$n"
  printf '%s\n' "$all" | head -12 | sed 's/^/  /'
  warn=$((warn+n))
  return 0
}

echo "═══ antd-verify $(date '+%Y-%m-%d %H:%M') ═══"
echo "目標: $ROOT"

# ---- 須有 index.html 才可驗證 ----
if [ ! -f "$ROOT/index.html" ]; then
  echo "✗ 資料夾內沒有 index.html,無可驗證目標"; exit 2
fi

# ---- 結構檢查(antd-static-layout 第1節) ----
for f in css/antd.css css/base.css; do
  if [ ! -f "$ROOT/$f" ]; then echo "[ERROR] 缺少 $f(標準結構,見 antd-static-layout 第1節)"; err=$((err+1)); fi
done

# ---- head 載入順序:Tailwind CDN → antd.css → base.css(第2節) ----
t=$(grep -n 'cdn\.tailwindcss\.com' "$ROOT/index.html" | head -1 | cut -d: -f1)
a=$(grep -n 'css/antd\.css' "$ROOT/index.html" | head -1 | cut -d: -f1)
b=$(grep -n 'css/base\.css' "$ROOT/index.html" | head -1 | cut -d: -f1)
if [ -n "$t" ] && [ -n "$a" ] && [ -n "$b" ]; then
  if [ "$t" -lt "$a" ] && [ "$a" -lt "$b" ]; then :; else
    echo "[ERROR] head 載入順序錯誤(須 Tailwind CDN → antd.css → base.css;目前行號 $t/$a/$b)"; err=$((err+1)); fi
else
  echo "[WARN] index.html 未同時找到 Tailwind CDN / antd.css / base.css 引用,無法檢查順序"; warn=$((warn+1))
fi

# ---- 內容檢查 ----
scan ERROR "<style> 區塊(CSS 須拆檔至 css/)" '<style' '*.html'
scan ERROR "inline script(JS 須拆檔至 js/)" '<script([^>]*)?>' '*.html' 'src='
scan ERROR "inline style(禁止;彈出層預設隱藏 display:none 除外)" 'style=' '*.html' 'display:[[:space:]]*none'
scan ERROR "JS 直接操作 .style.(應以 class 切換驅動)" '\.style\.' '*.js'
scan ERROR "Tailwind 顏色 class(元件外觀由 antd.css 負責)" '(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+' '*.html'
scan ERROR "Tailwind 圓角/陰影 class(元件外觀由 antd.css 負責)" "(^|[\"' ])(rounded(-[a-z0-9]+)?|shadow(-[a-z0-9]+)?)([\"' ]|\$)" '*.html'
scan WARN "HTML 內硬編碼色值(顏色應集中於 css 檔)" '#[0-9a-fA-F]{6}' '*.html'
scan WARN "Tailwind 字級/字重 class(元件文字由 antd.css 負責,版面標籤可例外)" "(^|[\"' :])(text-(xs|sm|base|lg|xl|2xl)|font-(thin|light|normal|medium|semibold|bold|black))([\"' ]|\$)" '*.html'
scan WARN "圖片未用 images/ 相對路徑" '<img[^>]*src=' '*.html' 'src="(images/|http|data:)'
scan WARN "window.open(「彈窗」一律頁內 Modal,獨立視窗做法已推翻;見 antd-proto-interactions §3/§7)" 'window\.open[[:space:]]*\(' '*.js'
scan_svg_hidden

echo
echo "── 結果: ERROR $err 處 / WARN $warn 處 ──"
echo "ℹ 靜態人工覆核:元件註解(名稱+關鍵props)齊全、DOM 對應 antd5 實際結構、彈出層位於 </body> 前、本輪僅動對應區塊檔案"
if [ $err -gt 0 ]; then echo "✗ 未通過:ERROR 必須修正後重跑"; exit 1; fi
if [ $warn -gt 0 ]; then echo "△ 無 ERROR;WARN 請逐項確認"; exit 0; fi
echo "✓ 通過"; exit 0
