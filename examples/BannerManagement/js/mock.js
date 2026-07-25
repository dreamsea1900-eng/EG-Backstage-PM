/* 頁面共用狀態與工具（mock；資料列預寫於 HTML 各 tbody，此處僅管理狀態）
   TODO: 實際資料由 GET /api/admin/banners（列表）、GET/PUT /api/admin/banners/carousel（輪播間隔）帶入 */
;(function () {
  'use strict'

  var DEMO_KEY = 'egBannerManagement.demo'

  // 版位設定（規格 A1/B2：彈窗標題、圖片區塊標題、「開啟遊戲」有無）
  var POSITIONS = {
    home_large: { modalTitle: '新增首頁大 Banner', imgTitle: '大 Banner 圖片', hasGame: true },
    home_small: { modalTitle: '新增首頁小 Banner', imgTitle: '小 Banner 圖片', hasGame: true },
    login: { modalTitle: '新增登入 Banner', imgTitle: '登入 Banner 圖片', hasGame: false },
    register: { modalTitle: '新增註冊 Banner', imgTitle: '註冊 Banner 圖片', hasGame: false }
  }

  window.BmState = {
    position: 'home_large',
    page: 1,
    pageSize: 20,
    filter: null, // { status, name, qs, qe }；null = 未搜尋（筆數顯示全部總筆數，規格 A3）
    sorting: false
  }

  window.BmMock = {
    positions: POSITIONS,
    demoKey: DEMO_KEY,

    // 解析 "YYYY-MM-DD" 或 "YYYY-MM-DD HH:mm"；失敗回 null
    parseDT: function (str) {
      if (!str) return null
      var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/.exec(str.trim())
      if (!m) return null
      var d = new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0)
      return isNaN(d.getTime()) ? null : d
    },

    // 即時擋 emoji（規格 A4/B5.1；TODO: emoji 判定範圍以正式實作定義為準）
    stripEmoji: function (str) {
      try {
        return str.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]/gu, '')
      } catch (e) {
        return str
      }
    },

    // demo 狀態（僅輪播間隔；try-catch＋型別過濾，毀損視同未初始化）
    loadDemo: function () {
      try {
        var raw = JSON.parse(localStorage.getItem(DEMO_KEY))
        if (raw && typeof raw.carouselInterval === 'number' && raw.carouselInterval >= 1) return raw
      } catch (e) { /* 資料毀損視同未初始化 */ }
      return { carouselInterval: 2 } // TODO: 未設定過顯示 2（規格 A5），實際由 GET /api/admin/banners/carousel 帶入
    },

    saveDemo: function (data) {
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify(data))
      } catch (e) { /* 寫入失敗不阻斷主流程 */ }
    }
  }
})()
