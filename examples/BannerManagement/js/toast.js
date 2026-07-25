/* message toast 控制器（antd-proto-interactions §6 模板）
   BmToast.show(type, text, duration)：text null 沿用 HTML 預設文案；
   duration 預設 3000ms，傳 0 表示不自動關閉（由呼叫端決定後續） */
;(function () {
  'use strict'

  var TYPES = ['success', 'error', 'warning']
  var timer = null

  window.BmToast = {
    show: function (type, text, duration) {
      var root = document.getElementById('bmToast')
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      TYPES.forEach(function (t) {
        document.getElementById('bmToast-' + t).hidden = t !== type
      })
      if (text != null) {
        document.getElementById('bmToastText-' + type).textContent = text
      }
      root.classList.add('bm-toast-show')
      var ms = duration == null ? 3000 : duration
      if (ms > 0) {
        timer = setTimeout(function () {
          root.classList.remove('bm-toast-show')
        }, ms)
      }
    },
    hide: function () {
      var root = document.getElementById('bmToast')
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      root.classList.remove('bm-toast-show')
    }
  }
})()
