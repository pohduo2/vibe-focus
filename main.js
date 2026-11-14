/* ============================================================================
   Vibe Focus · 桌宠番茄钟
   Electron 主进程（三个文件之一：package.json / main.js / index.html）

   职责边界：主进程只管"窗口这个人做不了的事"——
     · 透明无边框窗口 + 置顶（让宠物真的浮在桌面上）
     · 面板态 / 宠物态的窗口尺寸切换
     · 托盘常驻、全局快捷键、位置记忆、开机自启
   所有计时、音频、统计、动画都在 index.html 里，零构建。
   ============================================================================ */

const {
  app, BrowserWindow, ipcMain, Tray, Menu, screen, nativeImage, globalShortcut,
} = require('electron');
const path = require('path');
const fs = require('fs');

/* 内嵌托盘图标（base64 PNG，64×64），避免为了一个图标多带资源文件 */
const ICON_DATA_URL = 'data:image/png;base64,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';

/* 面板态窗口尺寸：宽度固定，高度由渲染进程测量后回传 */
const PANEL_WIDTH = 434;
const PANEL_PAD_X = 48;
const PANEL_PAD_Y = 40;
/* 宠物态窗口尺寸：气泡 + 番茄 + 投影光晕刚好放下，尽量少遮挡桌面 */
const PET_SIZE = { width: 132, height: 158 };
const MARGIN = 22;

let win = null;
let tray = null;
let isPet = false;
let panelSize = { width: PANEL_WIDTH, height: 600 };
let firstFit = true;
let quitting = false;

/* ---------------------------------------------------------------- 位置记忆 */
const statePath = () => path.join(app.getPath('userData'), 'window-state.json');

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), 'utf8'));
  } catch (err) {
    return null;
  }
}

function writeState(bounds) {
  try {
    fs.writeFileSync(statePath(), JSON.stringify(bounds), 'utf8');
  } catch (err) {
    /* 写不进去不影响使用 */
  }
}

/* ---------------------------------------------------------------- 创建窗口 */
function createWindow() {
  const saved = readState();

  win = new BrowserWindow({
    width: panelSize.width,
    height: panelSize.height,
    x: saved && Number.isFinite(saved.x) ? saved.x : undefined,
    y: saved && Number.isFinite(saved.y) ? saved.y : undefined,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    title: 'Vibe Focus',
    icon: nativeImage.createFromDataURL(ICON_DATA_URL),
    webPreferences: {
      // 只加载本地 index.html，没有任何远程内容。
      // 为满足"三个文件"的约束，这里不引入 preload：
      // 渲染进程直接持有 ipcRenderer，仅用于窗口尺寸/拖动这类消息。
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      backgroundThrottling: false, // 窗口被遮挡时不要节流，倒计时要继续走
      spellcheck: false,
      devTools: true,
    },
  });

  // Windows 上 'screen-saver' 层比 'floating' 更稳定地压住其他窗口
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setMenu(null);

  win.loadFile(path.join(__dirname, 'index.html'));

  win.on('moved', () => {
    if (win && !win.isDestroyed() && !isPet) writeState(win.getBounds());
  });

  win.on('close', (e) => {
    // 点关闭按钮不退出，只是藏到托盘（桌宠的默认行为）
    if (!quitting) {
      e.preventDefault();
      win.hide();
    }
  });

  win.on('closed', () => {
    win = null;
  });

  // 兜底：万一渲染进程没上报尺寸，也要让窗口出现
  setTimeout(() => {
    if (win && !win.isDestroyed() && !win.isVisible()) {
      placeAtCorner(panelSize);
      win.showInactive();
      firstFit = false;
    }
  }, 2500);
}

function placeAtCorner(size) {
  const wa = screen.getPrimaryDisplay().workArea;
  win.setBounds({
    x: Math.round(wa.x + wa.width - size.width - MARGIN),
    y: Math.round(wa.y + wa.height - size.height - MARGIN),
    width: size.width,
    height: size.height,
  });
}

/* ---------------------------------------------------------------- 主进程 ↔ 渲染进程 */
// 组件测量到的真实尺寸：窗口高度跟着内容走，不硬编码
ipcMain.on('ui:fit', (_e, size) => {
  if (!win || win.isDestroyed() || isPet) return;
  if (!size || !Number.isFinite(size.w) || !Number.isFinite(size.h)) return;

  const W = Math.max(340, Math.round(size.w) + PANEL_PAD_X);
  const H = Math.round(size.h) + PANEL_PAD_Y;
  panelSize = { width: W, height: H };

  if (firstFit) {
    firstFit = false;
    const saved = readState();
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      const wa = screen.getPrimaryDisplay().workArea;
      win.setBounds({
        x: Math.min(Math.max(saved.x, wa.x), wa.x + wa.width - W),
        y: Math.min(Math.max(saved.y, wa.y), wa.y + wa.height - H),
        width: W,
        height: H,
      });
    } else {
      placeAtCorner(panelSize);
    }
    win.showInactive(); // 不抢焦点，不打断用户正在做的事
    return;
  }

  const b = win.getBounds();
  if (Math.abs(b.width - W) <= 2 && Math.abs(b.height - H) <= 2) return;
  // 保持右下角锚点，视觉上不"跳"
  win.setBounds({ x: b.x + b.width - W, y: b.y + b.height - H, width: W, height: H });
});

// 面板 ↔ 宠物
ipcMain.on('ui:pet', (_e, on) => {
  if (!win || win.isDestroyed()) return;
  isPet = !!on;
  const b = win.getBounds();
  const size = isPet ? PET_SIZE : panelSize;
  win.setBounds({
    x: b.x + b.width - size.width,
    y: b.y + b.height - size.height,
    width: size.width,
    height: size.height,
  });
  if (isPet) writeState(win.getBounds());
});

// 宠物态拖动（无边框窗口没有标题栏，用鼠标位移驱动）
ipcMain.on('ui:move', (_e, d) => {
  if (!win || win.isDestroyed() || !d) return;
  const b = win.getBounds();
  win.setBounds({ x: Math.round(b.x + d.dx), y: Math.round(b.y + d.dy), width: b.width, height: b.height });
});

// 右键菜单
ipcMain.on('ui:menu', () => {
  if (!win) return;
  Menu.buildFromTemplate([
    { label: '展开面板', click: () => send('panel') },
    { label: '开始 / 暂停', click: () => send('toggle') },
    { label: '重置当前番茄', click: () => send('reset') },
    { type: 'separator' },
    { label: '隐藏到托盘', click: () => win.hide() },
    { label: '退出', click: () => { quitting = true; app.quit(); } },
  ]).popup({ window: win });
});

function send(cmd) {
  if (!win || win.isDestroyed()) return;
  if (!win.isVisible()) win.showInactive();
  win.webContents.send('cmd', cmd);
}

/* ---------------------------------------------------------------- 托盘 */
function buildTray() {
  const image = nativeImage.createFromDataURL(ICON_DATA_URL);
  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip('Vibe Focus · 番茄钟');
  tray.setContextMenu(TrayMenu());
  tray.on('click', toggleVisible);
  tray.on('double-click', () => {
    if (win) {
      win.showInactive();
      send('panel');
    }
  });
}

function TrayMenu() {
  return Menu.buildFromTemplate([
    { label: '显示面板', click: () => send('panel') },
    { label: '开始 / 暂停', click: () => send('toggle') },
    { label: '重置当前番茄', click: () => send('reset') },
    { type: 'separator' },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked, openAsHidden: true, args: ['--hidden'] });
        tray.setContextMenu(TrayMenu());
      },
    },
    {
      label: '窗口置顶',
      type: 'checkbox',
      checked: true,
      click: (item) => {
        if (win) win.setAlwaysOnTop(item.checked, 'screen-saver');
        tray.setContextMenu(TrayMenu());
      },
    },
    { type: 'separator' },
    { label: '退出 Vibe Focus', click: () => { quitting = true; app.quit(); } },
  ]);
}

function toggleVisible() {
  if (!win) return;
  if (win.isVisible()) win.hide();
  else win.showInactive();
}

/* ---------------------------------------------------------------- 生命周期 */
// 单实例：重复点击快捷方式时，把已有窗口叫出来（Windows 上很常见）
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      win.showInactive();
      send('panel');
    }
  });

  // Windows 任务栏/通知需要 AppUserModelId，否则图标会变成默认 Electron 图标
  app.setAppUserModelId('com.vibefocus.desktop');

  app.whenReady().then(() => {
    if (app.dock) app.dock.hide(); // macOS 上不占 Dock；Windows 无影响
    createWindow();
    buildTray();

    // 免切窗口控制：Ctrl+Shift+空格
    globalShortcut.register('CommandOrControl+Shift+Space', () => send('toggle'));
    // 唤出 / 收起：Ctrl+Shift+F
    globalShortcut.register('CommandOrControl+Shift+F', () => {
      if (!win) return;
      if (win.isVisible() && win.isFocused()) win.hide();
      else {
        win.showInactive();
        send('panel');
      }
    });

    if (process.argv.includes('--hidden')) {
      setTimeout(() => win && win.hide(), 1200);
    }

    app.on('activate', () => {
      if (!win) createWindow();
      else win.showInactive();
    });
  });

  app.on('window-all-closed', () => {
    // 托盘还在，不退出
    if (process.platform !== 'darwin' && quitting) app.quit();
  });

  app.on('will-quit', () => globalShortcut.unregisterAll());
}
