/* 排序模式：押灰鎖定、按鈕替換、拖曳排序、取消／儲存、離開保護（規格 Part C） */
;(function () {
  'use strict'

  var tableEl = document.getElementById('bmTable')
  var sortBtn = document.getElementById('bmSortBtn')
  var addBtn = document.getElementById('bmAddBtn')
  var cancelBtn = document.getElementById('bmSortCancelBtn')
  var saveBtn = document.getElementById('bmSortSaveBtn')
  var saveLoading = document.getElementById('bmSortSaveLoading')
  var intervalInput = document.getElementById('bmIntervalInput')
  var intervalBox = document.getElementById('bmInterval')
  var leaveRoot = document.getElementById('bmLeaveModalRoot')
  var leaveWrap = document.getElementById('bmLeaveModalWrap')

  var snapshot = []
  var changed = false
  var saving = false
  var dragRow = null
  var pendingEl = null

  function body() {
    return BmTable.activeBody()
  }

  function sameOrder() {
    var cur = BmTable.rows(body())
    if (cur.length !== snapshot.length) return false
    return cur.every(function (r, i) { return r === snapshot[i] })
  }

  function beforeUnloadFn(e) {
    e.preventDefault()
    e.returnValue = '' // 瀏覽器原生離開提示（規格 C6）
  }

  function updateBeforeUnload() {
    window.removeEventListener('beforeunload', beforeUnloadFn)
    if (BmState.sorting && changed) window.addEventListener('beforeunload', beforeUnloadFn)
  }

  // 鎖定清單：輪播間隔、狀態 Switch、編輯、刪除（規格 C3）
  function setLocked(on) {
    intervalInput.disabled = on
    intervalBox.classList.toggle('ant-input-number-disabled', on)
    BmTable.rows(body()).forEach(function (r) {
      var sw = r.querySelector('.bm-switch')
      sw.disabled = on
      sw.classList.toggle('ant-switch-disabled', on)
      r.querySelector('.bm-edit-btn').disabled = on
      r.querySelector('.bm-delete-btn').disabled = on
      if (on) r.setAttribute('draggable', 'true')
      else r.removeAttribute('draggable')
    })
  }

  function enter() {
    if (BmState.sorting) return
    BmState.sorting = true
    snapshot = BmTable.rows(body())
    changed = false
    saving = false
    tableEl.classList.add('bm-sorting')
    // 排序／新增按鈕消失，同位置顯示取消／儲存（規格 C3）
    sortBtn.hidden = true
    addBtn.hidden = true
    cancelBtn.hidden = false
    saveBtn.hidden = false
    setLocked(true)
  }

  function exit(restore) {
    if (restore) {
      var b = body()
      snapshot.forEach(function (r) { b.appendChild(r) }) // 回復原順序（規格 C5/C6）
      BmTable.renumber(b)
    }
    setLocked(false)
    BmState.sorting = false
    saving = false
    changed = false
    tableEl.classList.remove('bm-sorting')
    sortBtn.hidden = false
    addBtn.hidden = false
    cancelBtn.hidden = true
    saveBtn.hidden = true
    setSaveLoading(false)
    updateBeforeUnload()
    BmTable.refresh()
  }

  function setSaveLoading(on) {
    saveBtn.disabled = on
    saveBtn.classList.toggle('ant-btn-loading', on)
    saveLoading.hidden = !on
  }

  /* 拖曳調整順序：最上方＝第 1 順位（規格 C4；HTML5 DnD，僅滑鼠） */
  tableEl.addEventListener('dragstart', function (e) {
    var row = e.target.closest('tr.bm-row')
    if (!BmState.sorting || !row) return
    dragRow = row
    row.classList.add('bm-row-dragging')
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', '') } catch (err) { /* IE 相容，忽略 */ }
  })

  tableEl.addEventListener('dragover', function (e) {
    if (!dragRow) return
    e.preventDefault()
    var target = e.target.closest('tr.bm-row')
    if (!target || target === dragRow || target.parentElement !== dragRow.parentElement) return
    var rect = target.getBoundingClientRect()
    var before = e.clientY < rect.top + rect.height / 2
    target.parentElement.insertBefore(dragRow, before ? target : target.nextSibling)
  })

  tableEl.addEventListener('drop', function (e) {
    if (dragRow) e.preventDefault()
  })

  tableEl.addEventListener('dragend', function () {
    if (!dragRow) return
    dragRow.classList.remove('bm-row-dragging')
    dragRow = null
    BmTable.renumber(body()) // 拖曳後即時重排順位數字
    changed = !sameOrder()
    updateBeforeUnload()
  })

  /* 取消：回復原順序、離開模式、不儲存（規格 C5） */
  cancelBtn.addEventListener('click', function () {
    if (saving) return
    exit(true)
  })

  /* 儲存：成功→Toast＋更新順位＋離開；失敗→Toast＋停留並保留拖曳結果（規格 C5）
     TODO: 對接 PUT /api/admin/banners/order { position, orderedIds } */
  saveBtn.addEventListener('click', function () {
    if (saving || saveBtn.hidden) return
    saving = true
    setSaveLoading(true)
    setTimeout(function () {
      if (BmDemo.get('bmDemoSort') === 'success') {
        BmToast.show('success', '儲存成功')
        exit(false)
      } else {
        BmToast.show('error', '儲存失敗')
        saving = false
        setSaveLoading(false)
      }
    }, 600)
  })

  /* 站內離開保護（capture 攔截）：切換子選單／頁數／每頁筆數／點擊搜尋欄位／全域側欄（規格 C6）
     僅在順序有異動且未儲存時提示（D3-7 暫採規格建議；未異動直接放行並離開模式） */
  document.addEventListener('click', function (e) {
    if (!BmState.sorting) return
    var guard = e.target.closest('[data-guard]')
    if (!guard) return
    if (saving) {
      e.preventDefault()
      e.stopPropagation()
      return // 送出中鎖定
    }
    if (!changed) {
      exit(false) // 未異動：直接離開排序模式，事件續傳給原功能
      return
    }
    e.preventDefault()
    e.stopPropagation()
    pendingEl = e.target
    openLeave()
  }, true)

  function openLeave() {
    leaveRoot.classList.add('bm-modal-open')
  }

  function closeLeave() {
    leaveRoot.classList.remove('bm-modal-open')
  }

  /* 確認離開：不儲存（回復原順序）、前往目標操作；取消：停留排序模式（規格 C6） */
  document.getElementById('bmLeaveConfirm').addEventListener('click', function () {
    closeLeave()
    exit(true)
    var el = pendingEl
    pendingEl = null
    if (el) {
      setTimeout(function () {
        el.click()
        if (el.tagName === 'INPUT') el.focus()
      }, 0)
    }
  })

  document.getElementById('bmLeaveCancel').addEventListener('click', function () {
    pendingEl = null
    closeLeave()
  })

  leaveWrap.addEventListener('click', function (e) {
    if (e.target === leaveWrap) {
      pendingEl = null
      closeLeave() // 點 mask 外側＝取消（停留）
    }
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return
    if (leaveRoot.classList.contains('bm-modal-open')) {
      pendingEl = null
      closeLeave()
      e.preventDefault()
    }
  })

  window.BmSort = { enter: enter }
})()
