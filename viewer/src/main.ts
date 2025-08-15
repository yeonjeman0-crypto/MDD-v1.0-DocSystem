import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Electron 보안 설정
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

class MDDViewer {
  private mainWindow: BrowserWindow | null = null;
  private isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  constructor() {
    this.setupApp();
    this.setupEventListeners();
  }

  private setupApp(): void {
    // macOS에서 모든 창이 닫혀도 앱이 종료되지 않도록 설정
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    // 앱이 준비되면 창 생성
    app.whenReady().then(() => {
      this.createWindow();
    });
  }

  private createWindow(): void {
    // 메인 창 생성
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      icon: path.join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !this.isDev,
      },
      titleBarStyle: 'default',
      show: false, // 준비될 때까지 숨김
    });

    // 창 로딩
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:5174'); // Vite dev server
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // 창 준비 완료 시 표시
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (this.isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // 창 닫힘 처리
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 외부 링크는 기본 브라우저에서 열기
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private setupEventListeners(): void {
    // DRK 패키지 열기
    ipcMain.handle('open-drk-package', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        title: 'DRK 패키지 선택',
        filters: [
          { name: 'DRK 패키지', extensions: ['drkpack', 'drkdelta'] },
          { name: '모든 파일', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    });

    // 패키지 정보 읽기
    ipcMain.handle('read-package-info', async (_, filePath: string) => {
      try {
        if (!fs.existsSync(filePath)) {
          throw new Error('패키지 파일을 찾을 수 없습니다.');
        }

        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath);
        
        return {
          name: path.basename(filePath),
          size: stats.size,
          type: ext === '.drkpack' ? 'full' : 'delta',
          lastModified: stats.mtime,
          path: filePath
        };
      } catch (error) {
        console.error('패키지 정보 읽기 실패:', error);
        return null;
      }
    });

    // PDF 문서 목록 가져오기 (임시 구현)
    ipcMain.handle('get-document-list', async () => {
      // TODO: DRK 패키지에서 문서 목록 추출
      return [
        { id: '1', title: 'Main Manual', type: 'MM', path: '/sample.pdf' },
        { id: '2', title: 'Procedures PR-01', type: 'PR', path: '/pr-01.pdf' },
        { id: '3', title: 'Instructions I-01', type: 'I', path: '/i-01.pdf' },
      ];
    });

    // 앱 정보
    ipcMain.handle('get-app-info', async () => {
      return {
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
      };
    });

    // 앱 종료
    ipcMain.handle('quit-app', async () => {
      app.quit();
    });
  }
}

// Electron 앱 시작
new MDDViewer();

console.log('🚢 MDD Viewer - Maritime Document Distribution System');
console.log('📱 Electron Desktop Application');
console.log('🏢 DORIKO Team - Document Management Solution');