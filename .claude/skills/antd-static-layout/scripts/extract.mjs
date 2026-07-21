/**
 * extract.mjs — 抽取 Ant Design 5 全元件靜態 CSS(含彈出類元件)
 *
 * 用法:
 *   npm install
 *   node extract.mjs [輸出路徑]        # 預設輸出 ../assets/antd.css
 *
 * 重點:
 *   1. theme={{ hashed: false }} 關閉主題 hash,選擇器才是乾淨的
 *      .ant-btn / .ant-input,純 HTML 手寫 class 才能直接套用。
 *   2. @ant-design/static-style-extract 預設黑名單會跳過
 *      Modal / Drawer / Popconfirm / Popover / Tooltip / Tour,
 *      且不含 message / notification。此腳本手動補渲染,樣式才完整。
 *   3. 想改主題色:修改下方 theme.token 後重新執行即可。
 */
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import * as extractor from '@ant-design/static-style-extract';
import {
  ConfigProvider, App, Modal, Drawer,
  Popconfirm, Popover, Tooltip, Tour,
  message, notification,
} from 'antd';

const extractStyle = extractor.extractStyle ?? extractor.default;
const h = React.createElement;

const outFile = process.argv[2] ?? path.resolve(process.cwd(), '../assets/antd.css');

// message / notification 的樣式在 portal 內才註冊,SSR 渲染不到;
// 改渲染官方內部 PurePanel(antd 文件站同款做法)來註冊樣式。
// 此內部 API 在 5.x 穩定存在,若未來版本移除,改回黑名單補渲染即可。
const MsgPanel = message._InternalPanelDoNotUseOrYouWillBeFired;
const NotifPanel = notification._InternalPanelDoNotUseOrYouWillBeFired;

// 黑名單元件補渲染:元件函式一執行,樣式就會註冊進快取
const extras = h(React.Fragment, null,
  h(App, { key: 'app' }),
  h(MsgPanel, { key: 'msg', type: 'info', content: 'x' }),
  h(NotifPanel, { key: 'notif', message: 'x' }),
  h(Modal, { key: 'modal', open: true, getContainer: false }, 'x'),
  h(Drawer, { key: 'drawer', open: true, getContainer: false }, 'x'),
  h(Popconfirm, { key: 'popconfirm', title: 'x' }, h('span', null, 'x')),
  h(Popover, { key: 'popover', content: 'x' }, h('span', null, 'x')),
  h(Tooltip, { key: 'tooltip', title: 'x' }, h('span', null, 'x')),
  h(Tour, { key: 'tour', open: false, steps: [] }),
);

const css = extractStyle((node) =>
  h(ConfigProvider,
    {
      theme: {
        hashed: false,
        // 自訂主題範例(取消註解並修改後重跑):
        // token: { colorPrimary: '#1677ff', borderRadius: 6 },
      },
    },
    node,
    extras,
  ),
);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, css);

const kb = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log(`✅ 已產出 ${outFile}(${kb} KB)`);
