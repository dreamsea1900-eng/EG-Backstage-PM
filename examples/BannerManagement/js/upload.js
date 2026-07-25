/* 圖片上傳模擬：拖曳／點擊、進度條動畫、尺寸與大小驗證（規格 B5.5）
   結果分支由彈窗內 demo Radio 控制（轉 Figma 時忽略）：
   sim-success 點擊即成功（免選檔）／sim-size 尺寸不符／sim-1mb 大小不符／real 實際選檔驗證
   TODO: 對接圖片上傳 API */
;(function () {
  'use strict'

  var MAX_BYTES = 1024 * 1024
  // 模擬「尺寸不符」時的假實際寬高（依裝置示意）
  var FAKE_DIMS = { pc: '1520×356', mobile: '320×200', tablet: '768×300' }
  var states = {} // device -> { done, url, name, objectUrl, busy }

  function ctrl(el) {
    var device = el.dataset.device
    var st = (states[device] = { done: false, url: '', name: '', objectUrl: null, busy: false })
    var fileInput = el.querySelector('.bm-upload-file')
    var dragArea = el.querySelector('.ant-upload-drag')
    var progress = el.querySelector('.bm-upload-progress')
    var progressText = el.querySelector('.bm-upload-progress-text')
    var preview = el.querySelector('.bm-upload-preview')
    var previewImg = el.querySelector('.bm-upload-preview-img')
    var previewName = el.querySelector('.bm-upload-preview-name')
    var errorEl = el.querySelector('.bm-upload-error')

    function resetProgress() {
      progress.classList.remove('bm-prog-run', 'bm-prog-done', 'ant-progress-status-exception')
      progressText.textContent = '0%'
    }

    function runProgress(cb) {
      resetProgress()
      void progress.offsetWidth // 重新觸發 css 動畫
      progress.classList.add('bm-prog-run')
      var pct = 0
      var timer = setInterval(function () {
        pct += 10
        if (pct >= 100) {
          clearInterval(timer)
          progressText.textContent = '100%'
          progress.classList.remove('bm-prog-run')
          progress.classList.add('bm-prog-done')
          st.busy = false
          cb()
        } else {
          progressText.textContent = pct + '%'
        }
      }, 90)
    }

    function revoke() {
      if (st.objectUrl) {
        URL.revokeObjectURL(st.objectUrl)
        st.objectUrl = null
      }
    }

    function success(file) {
      revoke()
      var url = 'images/thumb-new.svg'
      if (file) {
        url = URL.createObjectURL(file)
        st.objectUrl = url
      }
      st.done = true
      st.url = url
      st.name = file ? file.name : '示意圖片.png'
      previewImg.src = url
      previewName.textContent = st.name
      preview.hidden = false
      errorEl.hidden = true
    }

    function fail(msg) {
      st.done = false
      st.url = ''
      preview.hidden = true
      errorEl.textContent = msg
      errorEl.hidden = false
      progress.classList.add('ant-progress-status-exception')
    }

    function dimsError(actual) {
      fail('圖片寬高為：' + actual + '，需要寬高為：' + el.dataset.w + '×' + el.dataset.h)
    }

    function sizeError() {
      fail('圖片大小不符合，需要大小為：1MB')
    }

    // 依 demo 分支處理一次上傳（file 可為 null＝免選檔模擬）
    function handle(file) {
      if (st.busy) return
      st.busy = true
      errorEl.hidden = true
      var mode = BmDemo.get('bmDemoUpload')
      runProgress(function () {
        if (mode === 'sim-size') return dimsError(FAKE_DIMS[device])
        if (mode === 'sim-1mb') return sizeError()
        if (mode === 'real' && file) {
          if (file.size > MAX_BYTES) return sizeError()
          var objUrl = URL.createObjectURL(file)
          var img = new Image()
          img.onload = function () {
            if (img.naturalWidth === +el.dataset.w && img.naturalHeight === +el.dataset.h) {
              success(file)
            } else {
              dimsError(img.naturalWidth + '×' + img.naturalHeight)
            }
            URL.revokeObjectURL(objUrl)
          }
          img.onerror = function () {
            URL.revokeObjectURL(objUrl)
            fail('圖片讀取失敗，請重試') // TODO: 讀取失敗文案規格未定義
          }
          img.src = objUrl
          return
        }
        success(file || null) // sim-success（拖入檔案時以實際檔案預覽）
      })
    }

    el.querySelector('.ant-upload-btn').addEventListener('click', function (e) {
      if (e.target === fileInput) return // 程式觸發 fileInput.click() 的冒泡，避免遞迴
      if (st.busy) return
      if (BmDemo.get('bmDemoUpload') === 'real') fileInput.click()
      else handle(null)
    })

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) handle(fileInput.files[0])
      fileInput.value = ''
    })

    dragArea.addEventListener('dragover', function (e) {
      e.preventDefault()
      dragArea.classList.add('ant-upload-drag-hover')
    })

    dragArea.addEventListener('dragleave', function () {
      dragArea.classList.remove('ant-upload-drag-hover')
    })

    dragArea.addEventListener('drop', function (e) {
      e.preventDefault()
      dragArea.classList.remove('ant-upload-drag-hover')
      var file = e.dataTransfer.files && e.dataTransfer.files[0]
      if (BmDemo.get('bmDemoUpload') === 'real') {
        if (file) handle(file)
      } else {
        handle(file || null)
      }
    })

    el.querySelector('.bm-upload-remove').addEventListener('click', function () {
      revoke()
      st.done = false
      st.url = ''
      preview.hidden = true
      errorEl.hidden = true
      resetProgress()
    })

    return {
      reset: function () {
        revoke()
        st.done = false
        st.url = ''
        st.busy = false
        preview.hidden = true
        errorEl.hidden = true
        resetProgress()
      },
      isDone: function () {
        return st.done
      },
      getUrl: function () {
        return st.url
      },
      hasError: function () {
        return !errorEl.hidden
      },
      // 送出驗證用：必填未上傳（不帶進度條錯誤色，僅欄位紅字）
      setFieldError: function (msg) {
        errorEl.textContent = msg
        errorEl.hidden = false
      }
    }
  }

  var ctrls = {}
  document.querySelectorAll('.bm-upload').forEach(function (el) {
    ctrls[el.dataset.device] = ctrl(el)
  })

  window.BmUpload = {
    reset: function () {
      Object.keys(ctrls).forEach(function (d) { ctrls[d].reset() })
    },
    isDone: function (d) {
      return ctrls[d].isDone()
    },
    getUrl: function (d) {
      return ctrls[d].getUrl()
    },
    hasError: function (d) {
      return ctrls[d].hasError()
    },
    setFieldError: function (d, msg) {
      ctrls[d].setFieldError(msg)
    }
  }
})()
