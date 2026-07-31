/* 【模板】message toast 控制器(只有 SCOPE.md 明確核准 toast 時使用)
   使用方式:複製到頁面 js/toast.js,將 Xxx/xxx 前綴改為頁面前綴(如 Tpb/tpb);
   刪減型別時 TYPES 與 toast.html 的 notice 區塊要同步刪。
   XxxToast.show(type, text, duration):text null 沿用 HTML 預設文案;
   duration 預設 3000ms,傳 0 表示不自動關閉(由呼叫端決定後續,如成功後重整) */
;(function () {
  'use strict'

  var TYPES = ['success', 'error', 'warning']
  var timer = null

  window.XxxToast = {
    show: function (type, text, duration) {
      var root = document.getElementById('xxxToast')
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      TYPES.forEach(function (t) {
        document.getElementById('xxxToast-' + t).hidden = t !== type
      })
      if (text != null) {
        document.getElementById('xxxToastText-' + type).textContent = text
      }
      root.classList.add('xxx-toast-show')
      var ms = duration == null ? 3000 : duration
      if (ms > 0) {
        timer = setTimeout(function () {
          root.classList.remove('xxx-toast-show')
        }, ms)
      }
    },
    hide: function () {
      var root = document.getElementById('xxxToast')
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      root.classList.remove('xxx-toast-show')
    }
  }
})()
