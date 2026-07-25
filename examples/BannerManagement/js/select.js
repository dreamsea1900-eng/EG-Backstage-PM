/* 靜態 Select 共用控制器（開關、選取、可搜尋過濾；下拉為欄位下方固定定位） */
;(function () {
  'use strict'

  var handlers = {} // id -> [fn]

  function root(el) {
    return el.closest('.bm-select')
  }

  function dropdown(sel) {
    return sel.querySelector('.ant-select-dropdown')
  }

  function closeAll(except) {
    document.querySelectorAll('.bm-select.ant-select-open').forEach(function (sel) {
      if (sel !== except) close(sel)
    })
  }

  function open(sel) {
    sel.classList.add('ant-select-open', 'ant-select-focused')
    dropdown(sel).hidden = false
    var input = sel.querySelector('.ant-select-selection-search-input')
    if (input) input.focus()
  }

  function close(sel) {
    sel.classList.remove('ant-select-open', 'ant-select-focused')
    dropdown(sel).hidden = true
    var input = sel.querySelector('.ant-select-selection-search-input')
    if (input) {
      if (input.value) {
        input.value = ''
        filterOptions(sel, '')
      }
      // 還原已選文字／placeholder 顯示（輸入後未選取即關閉）
      var label = sel.querySelector('.ant-select-selector > .ant-select-selection-item')
      var placeholder = sel.querySelector('.ant-select-selection-placeholder')
      var hasValue = !!sel.dataset.value
      label.hidden = !hasValue
      if (placeholder) placeholder.hidden = hasValue
    }
  }

  function filterOptions(sel, keyword) {
    var kw = keyword.trim().toLowerCase()
    var any = false
    sel.querySelectorAll('.ant-select-item-option').forEach(function (opt) {
      var name = (opt.dataset.name || opt.textContent).toLowerCase()
      var hit = !kw || name.indexOf(kw) !== -1
      opt.hidden = !hit
      if (hit) any = true
    })
    var empty = sel.querySelector('.bm-select-empty')
    if (empty) empty.hidden = any
  }

  function setValue(sel, value) {
    var label = sel.querySelector('.ant-select-selector > .ant-select-selection-item')
    var placeholder = sel.querySelector('.ant-select-selection-placeholder')
    var picked = null
    sel.querySelectorAll('.ant-select-item-option').forEach(function (opt) {
      var on = value != null && opt.dataset.value === String(value)
      opt.classList.toggle('ant-select-item-option-selected', on)
      if (on) picked = opt
    })
    sel.dataset.value = picked ? picked.dataset.value : ''
    if (picked) {
      label.textContent = picked.dataset.name || picked.textContent.trim()
      label.hidden = false
      if (placeholder) placeholder.hidden = true
    } else {
      label.textContent = ''
      if (placeholder) {
        label.hidden = true
        placeholder.hidden = false
      }
    }
    return picked
  }

  function init(sel) {
    sel.addEventListener('click', function (e) {
      if (e.target.closest('.ant-select-item-option')) {
        var opt = e.target.closest('.ant-select-item-option')
        setValue(sel, opt.dataset.value)
        close(sel)
        ;(handlers[sel.id] || []).forEach(function (fn) { fn(opt.dataset.value, opt) })
        return
      }
      if (e.target.closest('.ant-select-dropdown')) return
      if (sel.classList.contains('ant-select-open')) {
        // 搜尋型：點欄位維持展開（輸入中）
        if (!sel.classList.contains('bm-select-search')) close(sel)
      } else {
        closeAll(sel)
        open(sel)
      }
    })
    var input = sel.querySelector('.ant-select-selection-search-input')
    if (input) {
      input.addEventListener('input', function () {
        if (!sel.classList.contains('ant-select-open')) open(sel)
        filterOptions(sel, input.value)
        // 輸入中隱藏已選文字避免重疊（對齊 antd show-search 行為）
        var label = sel.querySelector('.ant-select-selector > .ant-select-selection-item')
        var placeholder = sel.querySelector('.ant-select-selection-placeholder')
        var typing = input.value.length > 0
        if (label.textContent) label.hidden = typing
        else if (placeholder) placeholder.hidden = typing
      })
    }
  }

  document.addEventListener('click', function (e) {
    if (!root(e.target)) closeAll(null)
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    var opened = document.querySelector('.bm-select.ant-select-open')
    if (opened) {
      close(opened)
      e.preventDefault() // 讓後續 Esc 監聽（Modal）判斷已被下拉消化
    }
  })

  document.querySelectorAll('.bm-select').forEach(init)

  window.BmSelect = {
    onChange: function (id, fn) {
      ;(handlers[id] = handlers[id] || []).push(fn)
    },
    getValue: function (id) {
      return document.getElementById(id).dataset.value || ''
    },
    // value 傳 null＝清空回 placeholder
    setValue: function (id, value) {
      return setValue(document.getElementById(id), value)
    },
    getOption: function (id) {
      var sel = document.getElementById(id)
      return sel.querySelector('.ant-select-item-option-selected')
    },
    filter: function (id, kw) {
      filterOptions(document.getElementById(id), kw || '')
    }
  }
})()
