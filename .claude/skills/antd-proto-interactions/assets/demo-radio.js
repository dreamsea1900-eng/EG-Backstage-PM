/* 【模板】demo Radio checked class 同步(antd-proto-interactions §4)
   併入 demo 區所屬區塊的 js 檔(非獨立檔),xxx 改頁面前綴;
   讀取選中值:document.querySelector('#xxxDemoGroup .ant-radio-input:checked').value */

/* Demo Radio(prototype 專用):切換 antd checked class(靜態 antd.css 依 class 上樣式) */
var radios = document.querySelectorAll('#xxxDemoGroup .ant-radio-input')
Array.prototype.forEach.call(radios, function (input) {
  input.addEventListener('change', function () {
    Array.prototype.forEach.call(radios, function (other) {
      var checked = other.checked
      other.closest('.ant-radio').classList.toggle('ant-radio-checked', checked)
      other.closest('.ant-radio-wrapper').classList.toggle('ant-radio-wrapper-checked', checked)
    })
  })
})
