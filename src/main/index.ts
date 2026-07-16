import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  initDatabase,
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  countRecords,
  countAll,
  getFilterOptions,
  searchAll,
  seedIfEmpty
} from './database';
import { schemas } from '../shared/schemas';
import { IPC } from '../shared/schema';

let mainWindow: BrowserWindow | null = null;

// 显式设置应用名
app.setName('Digital Product DB');

// 路径策略：
// - dev 模式：所有数据落在项目目录 .data/electron 下，规避 TRAE/IDE 沙箱拦截 ~/Library 写入
// - 生产模式：使用标准 macOS 路径 ~/Library/Application Support/Digital Product DB
if (!app.isPackaged) {
  const devDataDir = join(__dirname, '..', '..', '.data', 'electron');
  if (!existsSync(devDataDir)) mkdirSync(devDataDir, { recursive: true });
  app.setPath('userData', devDataDir);
} else {
  app.setPath('userData', join(app.getPath('appData'), 'Digital Product DB'));
}

// 规避未签名应用 GPU 子进程沙箱初始化失败问题
app.disableHardwareAcceleration();

// dev 模式下 TRAE/IDE 沙箱会拦截 chromium 子进程的 sandbox 系统调用，
// 导致 GPU/Network 进程反复崩溃，应用整体退出。dev 下禁用 sandbox 绕过。
if (!app.isPackaged) {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-gpu');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 680,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#ffffff',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // 开发环境加载 dev server，生产环境加载打包文件
  const isDev = !app.isPackaged;
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // 让渲染进程接管窗口拖动（标题栏区域）
  mainWindow.webContents.on('did-finish-load', () => {
    // no-op
  });

  // 外链在系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function registerIpc(): void {
  ipcMain.handle(IPC.LIST, (_e, query) => listRecords(query));
  ipcMain.handle(IPC.GET, (_e, categoryId, id) => getRecord(categoryId, id));
  ipcMain.handle(IPC.CREATE, (_e, categoryId, data) => createRecord(categoryId, data));
  ipcMain.handle(IPC.UPDATE, (_e, categoryId, id, data) => updateRecord(categoryId, id, data));
  ipcMain.handle(IPC.DELETE, (_e, categoryId, id) => {
    deleteRecord(categoryId, id);
    return true;
  });
  ipcMain.handle(IPC.COUNT, (_e, categoryId) => countRecords(categoryId));
  ipcMain.handle(IPC.COUNT_ALL, () => countAll());
  ipcMain.handle(IPC.FILTERS, (_e, categoryId) => getFilterOptions(categoryId));
  ipcMain.handle(IPC.SEARCH, (_e, keyword) => searchAll(keyword));
  ipcMain.handle(IPC.SEED, () => {
    seedIfEmpty();
    return countAll();
  });
  ipcMain.handle(IPC.GET_SCHEMAS, () => schemas);

  // 窗口控制
  ipcMain.on('win:minimize', () => mainWindow?.minimize());
  ipcMain.on('win:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('win:close', () => mainWindow?.close());
  ipcMain.on('win:set-theme', (_e, theme: 'system' | 'light' | 'dark') => {
    nativeTheme.themeSource = theme;
  });
}

app.whenReady().then(() => {
  initDatabase();
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
