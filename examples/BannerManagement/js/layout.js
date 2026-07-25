/* 全站導覽與版位子選單（子選單切換版位，規格 A1；排序模式中的攔截由 sort-mode.js capture 處理） */
;(function () {
  'use strict'

  // 版位子選單：切換選中狀態＋通知列表切換版位
  document.querySelectorAll('#bmPositionMenu [data-position]').forEach(function (item) {
    item.addEventListener('click', function () {
      if (BmState.sorting) return // 排序模式由 guard 接手（未異動時 guard 已先退出模式）
      if (item.dataset.position === BmState.position) return
      document.querySelectorAll('#bmPositionMenu .ant-menu-item').forEach(function (li) {
        li.classList.toggle('ant-menu-item-selected', li === item)
      })
      BmTable.switchPosition(item.dataset.position)
    })
  })

  // 全域側欄選單：非本規格範圍，僅提示（TODO: 其他頁面路由）
  document.querySelectorAll('.bm-sider-menu [data-guard="nav"]').forEach(function (item) {
    item.addEventListener('click', function () {
      if (BmState.sorting) return
      if (item.querySelector('.ant-menu-title-content').textContent === '版面設定') return
      BmToast.show('warning', '其他選單頁面非本規格範圍')
    })
  })
})()
