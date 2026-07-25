/* 搜尋條件區（規格 A4：AND、名稱模糊不分大小寫、即時擋 emoji、期間限 3 個月） */
;(function () {
  'use strict'

  var nameInput = document.getElementById('bmFilterName')
  var startInput = document.getElementById('bmFilterStart')
  var endInput = document.getElementById('bmFilterEnd')

  // 名稱即時擋 emoji（規格 A4；過濾＋送出前驗證為規格建議作法）
  nameInput.addEventListener('input', function () {
    var stripped = BmMock.stripEmoji(nameInput.value)
    if (stripped !== nameInput.value) nameInput.value = stripped
  })

  function threeMonthsAfter(d) {
    var r = new Date(d.getTime())
    r.setMonth(r.getMonth() + 3)
    return r
  }

  document.getElementById('bmSearchBtn').addEventListener('click', function () {
    if (BmState.sorting) return // 排序模式由 guard 接手
    var qsRaw = startInput.value.trim()
    var qeRaw = endInput.value.trim()
    var qs = null
    var qe = null
    if (qsRaw) {
      qs = BmMock.parseDT(qsRaw)
      if (!qs) return BmToast.show('warning', '開始日期格式不正確（YYYY-MM-DD）') // TODO: 格式錯誤文案規格未定義
    }
    if (qeRaw) {
      qe = BmMock.parseDT(qeRaw)
      if (!qe) return BmToast.show('warning', '結束日期格式不正確（YYYY-MM-DD）')
      qe = new Date(qe.getFullYear(), qe.getMonth(), qe.getDate(), 23, 59, 59) // 結束日含當日
    }
    if (qs && qe && qe < qs) return BmToast.show('warning', '結束日期需晚於開始日期') // TODO: 文案規格未定義
    // 查詢範圍限 3 個月內（規格 A4；超過送出前提示為規格建議）
    if (qs && qe && qe > threeMonthsAfter(qs)) return BmToast.show('warning', '查詢範圍限 3 個月內')

    BmState.filter = {
      status: BmSelect.getValue('bmFilterStatus'),
      name: nameInput.value.trim().toLowerCase(),
      qs: qs,
      qe: qe
    }
    BmState.page = 1
    BmTable.refresh()
  })

  // 重設搜尋欄位回預設（切版位／新增成功刷新時由 table.js 呼叫）
  window.BmSearch = {
    reset: function () {
      BmSelect.setValue('bmFilterStatus', 'all')
      nameInput.value = ''
      startInput.value = ''
      endInput.value = ''
      BmState.filter = null
    }
  }
})()
