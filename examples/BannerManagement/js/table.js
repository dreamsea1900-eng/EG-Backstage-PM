/* 資料表：版位切換、搜尋過濾、分頁、Switch、編輯／刪除入口、新增列插入（規格 A3/A5/A6） */
;(function () {
  'use strict'

  var PAGE_ITEMS = Array.prototype.slice.call(document.querySelectorAll('#bmPagination .ant-pagination-item'))
  var prevBtn = document.getElementById('bmPagePrev')
  var nextBtn = document.getElementById('bmPageNext')
  var countEl = document.getElementById('bmCount')

  function activeBody() {
    return document.getElementById('bmBody-' + BmState.position)
  }

  function rows(body) {
    return Array.prototype.slice.call(body.querySelectorAll('tr.bm-row'))
  }

  // 各條件 AND（規格 A4）；期間比對暫採「與 Banner 顯示期間有交集」（TODO: 比對語意規格未定義）
  function matchRow(row, f) {
    if (f.status === 'enabled' && row.dataset.enabled !== '1') return false
    if (f.status === 'disabled' && row.dataset.enabled !== '0') return false
    if (f.name && row.dataset.name.toLowerCase().indexOf(f.name) === -1) return false
    if (f.qs || f.qe) {
      var rs = BmMock.parseDT(row.dataset.start)
      var re = BmMock.parseDT(row.dataset.end)
      if (f.qs && re && re < f.qs) return false
      if (f.qe && rs && rs > f.qe) return false
    }
    return true
  }

  function refresh() {
    var body = activeBody()
    var all = rows(body)
    var f = BmState.filter
    var matched = f ? all.filter(function (r) { return matchRow(r, f) }) : all
    var pages = Math.max(1, Math.ceil(matched.length / BmState.pageSize))
    if (BmState.page > pages) BmState.page = pages
    var from = (BmState.page - 1) * BmState.pageSize
    var to = from + BmState.pageSize
    all.forEach(function (r) {
      var idx = matched.indexOf(r)
      r.hidden = idx === -1 || idx < from || idx >= to
    })
    // 筆數：預設＝全部總筆數、搜尋後＝符合條件筆數（規格 A3/A5）
    countEl.textContent = matched.length
    // 分頁（頁碼樣板最多 3 頁，涵蓋 demo 資料量）
    PAGE_ITEMS.forEach(function (li) {
      var p = +li.dataset.page
      li.hidden = p > pages
      li.classList.toggle('ant-pagination-item-active', p === BmState.page)
    })
    prevBtn.classList.toggle('ant-pagination-disabled', BmState.page <= 1)
    nextBtn.classList.toggle('ant-pagination-disabled', BmState.page >= pages)
  }

  // 依 DOM 順序重排「排序」欄（最上方＝第 1 順位，規格 A5/C4）
  function renumber(body) {
    rows(body).forEach(function (r, i) {
      r.querySelector('.bm-col-order').textContent = i + 1
    })
  }

  function switchPosition(pos) {
    BmState.position = pos
    document.querySelectorAll('.bm-tbody').forEach(function (tb) {
      tb.hidden = tb.dataset.position !== pos
    })
    // 切版位回預設載入行為（規格 A3；TODO: 每頁筆數維持使用者當前選擇，是否也重設待確認）
    BmSearch.reset()
    BmState.page = 1
    refresh()
  }

  // 新增成功：排第 1 順位、其餘遞延（規格 B6）；刷新暫實作為重設回預設視圖（TODO: 規格僅寫「刷新列表」）
  function insertFirst(data) {
    var tpl = document.querySelector('#bmRowTemplate tr').cloneNode(true)
    tpl.dataset.name = data.name
    tpl.dataset.enabled = data.enabled ? '1' : '0'
    tpl.dataset.start = data.start
    tpl.dataset.end = data.end
    tpl.querySelector('.bm-cell-name').textContent = data.name
    tpl.querySelector('.bm-thumb').src = data.thumb
    tpl.querySelector('.bm-target').textContent = data.target
    tpl.querySelector('.bm-period').textContent = data.start + ' ~ ' + data.end
    var sw = tpl.querySelector('.bm-switch')
    sw.classList.toggle('ant-switch-checked', !!data.enabled)
    sw.setAttribute('aria-checked', data.enabled ? 'true' : 'false')
    var body = activeBody()
    body.insertBefore(tpl, body.firstElementChild)
    renumber(body)
    BmSearch.reset()
    BmState.page = 1
    refresh()
  }

  // 列內操作（事件代理）：Switch 直接生效；編輯／刪除待後續規格
  document.getElementById('bmTable').addEventListener('click', function (e) {
    if (BmState.sorting) return // 排序模式押灰鎖定（規格 C3）
    var sw = e.target.closest('.bm-switch')
    if (sw) {
      var on = !sw.classList.contains('ant-switch-checked')
      sw.classList.toggle('ant-switch-checked', on)
      sw.setAttribute('aria-checked', on ? 'true' : 'false')
      sw.closest('tr').dataset.enabled = on ? '1' : '0'
      return // TODO: 對接 PATCH /api/admin/banners/{id}/status；樂觀更新失敗回滾為規格建議
    }
    if (e.target.closest('.bm-edit-btn') || e.target.closest('.bm-delete-btn')) {
      BmToast.show('warning', '編輯／刪除流程待後續規格提供') // TODO: 規格 v3 文件範圍註記
    }
  })

  // 分頁操作
  PAGE_ITEMS.forEach(function (li) {
    li.addEventListener('click', function () {
      if (BmState.sorting) return
      BmState.page = +li.dataset.page
      refresh()
    })
  })

  prevBtn.addEventListener('click', function () {
    if (BmState.sorting || prevBtn.classList.contains('ant-pagination-disabled')) return
    BmState.page -= 1
    refresh()
  })

  nextBtn.addEventListener('click', function () {
    if (BmState.sorting || nextBtn.classList.contains('ant-pagination-disabled')) return
    BmState.page += 1
    refresh()
  })

  BmSelect.onChange('bmPageSize', function (v) {
    if (BmState.sorting) return
    BmState.pageSize = +v
    BmState.page = 1
    refresh()
  })

  window.BmTable = {
    activeBody: activeBody,
    rows: rows,
    refresh: refresh,
    renumber: renumber,
    switchPosition: switchPosition,
    insertFirst: insertFirst
  }

  refresh()
})()
