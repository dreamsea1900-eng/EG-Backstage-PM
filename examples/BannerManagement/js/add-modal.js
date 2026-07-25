/* 新增 Banner 彈窗：開關、欄位互動、驗證、送出（規格 Part B）
   TODO: 對接 POST /api/admin/banners；驗證文案為流程圖草案，正式以 i18n 定稿為準 */
;(function () {
  'use strict'

  var root = document.getElementById('bmAddModalRoot')
  var wrap = document.getElementById('bmAddModalWrap')
  var titleEl = document.getElementById('bmAddModalTitle')
  var imgTitleEl = document.getElementById('bmImgSectionTitle')
  var nameInput = document.getElementById('bmName')
  var nameWrap = document.getElementById('bmNameWrap')
  var nameCount = document.getElementById('bmNameCount')
  var statusSwitch = document.getElementById('bmStatusSwitch')
  var statusText = document.getElementById('bmStatusText')
  var timeRange = document.getElementById('bmTimeRange')
  var startInput = document.getElementById('bmStartAt')
  var endInput = document.getElementById('bmEndAt')
  var gameOpt = document.getElementById('bmActionOpt-game')
  var subEvent = document.getElementById('bmSubEvent')
  var subGame = document.getElementById('bmSubGame')
  var subLink = document.getElementById('bmSubLink')
  var linkInput = document.getElementById('bmLinkUrl')
  var linkExtra = document.getElementById('bmLinkExtra')
  var applyWrap = document.getElementById('bmApplyWrap')
  var applyInput = document.getElementById('bmApplyEventTime')
  var submitBtn = document.getElementById('bmAddSubmitBtn')
  var submitLoading = document.getElementById('bmAddSubmitLoading')
  var submitting = false

  // 欄位錯誤對照：explain 容器／文字／控制項 status class
  var ERR = {
    name: { wrap: 'bmErrNameWrap', msg: 'bmErrName', ctrl: nameWrap, cls: ['ant-input-affix-wrapper-status-error', 'ant-input-status-error'] },
    time: { wrap: 'bmErrTimeWrap', msg: 'bmErrTime', ctrl: timeRange, cls: ['ant-picker-status-error'] },
    action: { wrap: 'bmErrActionWrap', msg: 'bmErrAction', ctrl: null, cls: [] },
    event: { wrap: 'bmErrEventWrap', msg: 'bmErrEvent', ctrl: null, cls: ['ant-select-status-error'] },
    game: { wrap: 'bmErrGameWrap', msg: 'bmErrGame', ctrl: null, cls: ['ant-select-status-error'] },
    link: { wrap: 'bmErrLinkWrap', msg: 'bmErrLink', ctrl: linkInput, cls: ['ant-input-status-error'] }
  }
  ERR.event.ctrl = document.getElementById('bmEventSelect')
  ERR.game.ctrl = document.getElementById('bmGameSelect')

  function setErr(key, msg) {
    var c = ERR[key]
    document.getElementById(c.wrap).hidden = msg == null
    if (msg != null) document.getElementById(c.msg).textContent = msg
    if (c.ctrl) {
      c.cls.forEach(function (cl) {
        c.ctrl.classList.toggle(cl, msg != null)
      })
    }
  }

  function clearErrs() {
    Object.keys(ERR).forEach(function (k) { setErr(k, null) })
  }

  function currentAction() {
    var checked = document.querySelector('input[name="bmAction"]:checked')
    return checked ? checked.value : ''
  }

  /* ── 欄位互動 ── */

  // 名稱：即時擋 emoji＋字數計（規格 B5.1；超過 50 以送出驗證擋）
  nameInput.addEventListener('input', function () {
    var stripped = BmMock.stripEmoji(nameInput.value)
    if (stripped !== nameInput.value) nameInput.value = stripped
    nameCount.textContent = nameInput.value.length + ' / 50'
    setErr('name', null)
  })

  // 狀態 Switch：預設停用（規格 B5.2）
  statusSwitch.addEventListener('click', function () {
    var on = !statusSwitch.classList.contains('ant-switch-checked')
    statusSwitch.classList.toggle('ant-switch-checked', on)
    statusSwitch.setAttribute('aria-checked', on ? 'true' : 'false')
    statusText.textContent = on ? '啟用' : '停用（預設）'
  })

  startInput.addEventListener('input', function () { setErr('time', null) })
  endInput.addEventListener('input', function () { setErr('time', null) })
  linkInput.addEventListener('input', function () { setErr('link', null) })

  // 點擊行為：5 選項、切換只顯示當前子欄位、已填值保留至送出（規格 B5.4）
  document.querySelectorAll('input[name="bmAction"]').forEach(function (input) {
    input.addEventListener('change', function () {
      document.querySelectorAll('input[name="bmAction"]').forEach(function (other) {
        var checked = other.checked
        other.closest('.ant-radio').classList.toggle('ant-radio-checked', checked)
        other.closest('.ant-radio-wrapper').classList.toggle('ant-radio-wrapper-checked', checked)
      })
      var action = input.value
      subEvent.hidden = action !== 'event'
      subGame.hidden = action !== 'game'
      subLink.hidden = action !== 'internal_link' && action !== 'external_link'
      // 範例文字（規格 B5.4；內部連結補「語系前 Domain」填寫規則）
      linkExtra.textContent = action === 'internal_link'
        ? '範例：https://www.example.com（請填語系前的 Domain）'
        : '範例：https://www.example.com'
      setErr('action', null)
    })
  })

  /* ── 開啟活動：選擇活動＋套用活動廣告時間（規格 B5.4(e)） ── */

  function lockTime(on) {
    startInput.disabled = on
    endInput.disabled = on
    timeRange.classList.toggle('ant-picker-disabled', on)
  }

  // 勾選＝複製活動廣告起迄至顯示時間並鎖定；活動異動連動更新由後端／前台取值，prototype 不模擬
  function copyEventTime() {
    var opt = BmSelect.getOption('bmEventSelect')
    if (!opt) return
    startInput.value = opt.dataset.start
    endInput.value = opt.dataset.end
    setErr('time', null)
    lockTime(true)
  }

  function setApplyEnabled(on) {
    applyInput.disabled = !on
    applyWrap.classList.toggle('ant-checkbox-wrapper-disabled', !on)
  }

  function setApplyChecked(on) {
    applyInput.checked = on
    applyWrap.querySelector('.ant-checkbox').classList.toggle('ant-checkbox-checked', on)
  }

  BmSelect.onChange('bmEventSelect', function () {
    setErr('event', null)
    setApplyEnabled(true) // 未選活動前不可勾選（規格未定義前置狀態，暫採停用）
    if (applyInput.checked) copyEventTime() // 換活動時同步帶入新時間
  })

  applyInput.addEventListener('change', function () {
    setApplyChecked(applyInput.checked)
    if (applyInput.checked) copyEventTime()
    else lockTime(false) // 取消勾選＝解除鎖定、保留最後帶入值（D3-3 暫採規格建議）
  })

  BmSelect.onChange('bmGameSelect', function () {
    setErr('game', null)
  })

  // Demo：可選活動清單有／無資料（轉 Figma 時忽略）
  function applyEventsDemo() {
    var empty = BmDemo.get('bmDemoEvents') === 'empty'
    document.querySelectorAll('#bmEventSelect .ant-select-item-option').forEach(function (opt) {
      opt.hidden = empty
    })
    document.getElementById('bmEventEmpty').hidden = !empty
    if (empty) {
      BmSelect.setValue('bmEventSelect', null)
      setApplyChecked(false)
      setApplyEnabled(false)
      lockTime(false)
    }
  }

  document.querySelectorAll('input[name="bmDemoEvents"]').forEach(function (input) {
    input.addEventListener('change', applyEventsDemo)
  })

  /* ── 開關 ── */

  function reset() {
    clearErrs()
    nameInput.value = ''
    nameCount.textContent = '0 / 50'
    statusSwitch.classList.remove('ant-switch-checked')
    statusSwitch.setAttribute('aria-checked', 'false')
    statusText.textContent = '停用（預設）'
    startInput.value = ''
    endInput.value = ''
    lockTime(false)
    document.querySelectorAll('input[name="bmAction"]').forEach(function (r) {
      r.checked = false
      r.closest('.ant-radio').classList.remove('ant-radio-checked')
      r.closest('.ant-radio-wrapper').classList.remove('ant-radio-wrapper-checked')
    })
    subEvent.hidden = true
    subGame.hidden = true
    subLink.hidden = true
    linkInput.value = ''
    linkExtra.textContent = '範例：https://www.example.com'
    BmSelect.setValue('bmEventSelect', null)
    BmSelect.setValue('bmGameSelect', null)
    setApplyChecked(false)
    setApplyEnabled(false)
    BmUpload.reset()
    applyEventsDemo()
    submitting = false
    setSubmitLoading(false)
  }

  function open() {
    reset()
    // 標題、圖片區塊標題、「開啟遊戲」有無依版位（規格 B2/B5.4）
    var meta = BmMock.positions[BmState.position]
    titleEl.textContent = meta.modalTitle
    imgTitleEl.textContent = meta.imgTitle
    gameOpt.hidden = !meta.hasGame
    root.classList.add('bm-modal-open')
    wrap.scrollTop = 0
  }

  function close() {
    root.classList.remove('bm-modal-open')
  }

  // 取消三件套：關閉鈕、點 mask 外側、Esc＝取消不儲存（規格 B6；送出中鎖定）
  document.getElementById('bmAddModalClose').addEventListener('click', function () {
    if (!submitting) close()
  })

  document.getElementById('bmAddCancelBtn').addEventListener('click', function () {
    if (!submitting) close()
  })

  wrap.addEventListener('click', function (e) {
    if (e.target === wrap && !submitting) close()
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return
    if (root.classList.contains('bm-modal-open') && !submitting) close()
  })

  /* ── 驗證與送出（規格 B5/B6） ── */

  function setSubmitLoading(on) {
    submitBtn.disabled = on
    submitBtn.classList.toggle('ant-btn-loading', on)
    submitLoading.hidden = !on
  }

  function validate() {
    clearErrs()
    var ok = true
    var action = currentAction()

    var name = nameInput.value.trim()
    if (!name) {
      setErr('name', 'Banner 名稱是必填欄位')
      ok = false
    } else if (name.length > 50) {
      setErr('name', '最多只能輸入 50 字')
      ok = false
    }

    var sRaw = startInput.value.trim()
    var eRaw = endInput.value.trim()
    var s = BmMock.parseDT(sRaw)
    var e = BmMock.parseDT(eRaw)
    var locked = applyInput.checked
    if (!sRaw || !eRaw || !s || !e) {
      setErr('time', '顯示時間是必填欄位') // TODO: 格式錯誤獨立文案規格未定義，暫併必填提示
      ok = false
    } else if (e <= s) {
      setErr('time', '結束時間需晚於開始時間')
      ok = false
    } else if (!locked && s < new Date()) {
      // 套用鎖定時跳過（進行中活動套用必為過去時間，規格衝突待確認）
      setErr('time', '開始時間不能早於現在')
      ok = false
    } else if (action === 'event' && !locked) {
      // 已選活動且未勾選套用：顯示時間需符合活動廣告時間（「不符」判定暫採「需落在範圍內」，待確認）
      var opt = BmSelect.getOption('bmEventSelect')
      if (opt) {
        var evS = BmMock.parseDT(opt.dataset.start)
        var evE = BmMock.parseDT(opt.dataset.end)
        if (s < evS || e > evE) {
          setErr('time', '顯示時間不符合活動廣告時間')
          ok = false
        }
      }
    }

    if (!action) {
      setErr('action', '點擊行為是必填欄位')
      ok = false
    }

    if (action === 'event' && !BmSelect.getValue('bmEventSelect')) {
      // 無任何可選活動時文案不同（規格 B5.4(e)；文案是否更名見 D3-4 待確認）
      setErr('event', BmDemo.get('bmDemoEvents') === 'empty' ? '沒有符合顯示時間的活動' : '選擇活動是必填欄位')
      ok = false
    }

    if (action === 'game' && !BmSelect.getValue('bmGameSelect')) {
      setErr('game', '選擇遊戲是必填欄位')
      ok = false
    }

    if (action === 'internal_link' || action === 'external_link') {
      var url = linkInput.value.trim()
      if (!url) {
        setErr('link', '連結是必填欄位')
        ok = false
      } else if (!/^https?:\/\//i.test(url)) {
        setErr('link', '格式不符，需以 http:// / https:// 開頭') // 站內網域驗證深度待確認（D3-2）
        ok = false
      }
    }

    // 圖片：PC/Mobile 必填、Tablet 選填（規格 B5.5）；已有尺寸／大小錯誤時保留該錯誤
    ;['pc', 'mobile'].forEach(function (d) {
      if (!BmUpload.isDone(d)) {
        if (!BmUpload.hasError(d)) {
          BmUpload.setFieldError(d, d === 'pc' ? 'PC 圖片是必填欄位' : 'Mobile 圖片是必填欄位')
        }
        ok = false
      }
    })

    return ok
  }

  submitBtn.addEventListener('click', function () {
    if (submitting) return
    if (!validate()) return // 失敗：inline 錯誤、保留彈窗、不送出（規格 B6）
    submitting = true
    setSubmitLoading(true)
    // mock API：TODO: 對接 POST /api/admin/banners（成功後該筆 order=1 其餘遞延）
    setTimeout(function () {
      var action = currentAction()
      var target = '－'
      if (action === 'event') target = BmSelect.getOption('bmEventSelect').dataset.name
      if (action === 'game') target = BmSelect.getOption('bmGameSelect').dataset.name
      if (action === 'internal_link' || action === 'external_link') target = linkInput.value.trim()
      BmTable.insertFirst({
        name: nameInput.value.trim(),
        enabled: statusSwitch.classList.contains('ant-switch-checked'),
        start: startInput.value.trim(),
        end: endInput.value.trim(),
        target: target,
        thumb: BmUpload.getUrl('pc') || 'images/thumb-new.svg'
      })
      submitting = false
      setSubmitLoading(false)
      close()
      BmToast.show('success', '新增成功') // 排第 1 順位其餘遞延＋關閉彈窗並刷新列表（規格 B6）
    }, 600)
  })

  window.BmAddModal = { open: open }
})()
