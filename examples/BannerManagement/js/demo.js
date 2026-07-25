/* Demo 控制（prototype 專用，轉 Figma 時忽略）：Radio checked class 同步＋讀值＋重設 */
;(function () {
  'use strict'

  // 所有 demo Radio group：change 時同步 antd checked class（antd-proto-interactions §4）
  document.querySelectorAll('.bm-demo input[type="radio"]').forEach(function (input) {
    input.addEventListener('change', function () {
      document.getElementsByName(input.name).forEach(function (other) {
        var checked = other.checked
        other.closest('.ant-radio').classList.toggle('ant-radio-checked', checked)
        other.closest('.ant-radio-wrapper').classList.toggle('ant-radio-wrapper-checked', checked)
      })
    })
  })

  window.BmDemo = {
    // name: bmDemoSort / bmDemoUpload / bmDemoEvents
    get: function (name) {
      var checked = document.querySelector('input[name="' + name + '"]:checked')
      return checked ? checked.value : ''
    }
  }

  // 重設 Demo 資料：清 localStorage＋reload
  document.getElementById('bmResetDemo').addEventListener('click', function () {
    try {
      localStorage.removeItem(BmMock.demoKey)
    } catch (e) { /* 清除失敗仍重載 */ }
    location.reload()
  })
})()
