/* 列表工具列：輪播間隔＋排序／新增入口（規格 A5） */
;(function () {
  'use strict'

  var MIN = 1
  var MAX = 60 // TODO: 輪播間隔範圍規格未定義，暫 1–60
  var input = document.getElementById('bmIntervalInput')
  var demo = BmMock.loadDemo()
  input.value = demo.carouselInterval

  function save(val) {
    var v = Math.min(MAX, Math.max(MIN, Math.round(val)))
    input.value = v
    demo.carouselInterval = v
    BmMock.saveDemo(demo) // TODO: 儲存時機規格未定義，暫變更即存；對接 PUT /api/admin/banners/carousel
  }

  function locked() {
    return BmState.sorting || input.disabled
  }

  document.getElementById('bmIntervalUp').addEventListener('click', function () {
    if (locked()) return
    save((parseInt(input.value, 10) || 2) + 1)
  })

  document.getElementById('bmIntervalDown').addEventListener('click', function () {
    if (locked()) return
    save((parseInt(input.value, 10) || 2) - 1)
  })

  input.addEventListener('change', function () {
    if (locked()) return
    var v = parseInt(input.value, 10)
    save(isNaN(v) ? 2 : v)
  })

  document.getElementById('bmSortBtn').addEventListener('click', function () {
    BmSort.enter()
  })

  document.getElementById('bmAddBtn').addEventListener('click', function () {
    BmAddModal.open()
  })
})()
