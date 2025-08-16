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
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js'),
        sandbox: false, // PDF.js requires access to file system
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

    // DRK 패키지에서 문서 목록 추출
    ipcMain.handle('extract-package-documents', async (_, packagePath: string) => {
      try {
        console.log('Extracting documents from package:', packagePath);
        
        // DRK 패키지 파일 읽기
        const packageData = fs.readFileSync(packagePath);
        
        // 매직 헤더 확인 (DRK\x00)
        const isValidHeader = packageData[0] === 0x44 && // 'D'
                             packageData[1] === 0x52 && // 'R'  
                             packageData[2] === 0x4B && // 'K'
                             packageData[3] === 0x00;   // '\x00'
        
        if (!isValidHeader) {
          throw new Error('유효하지 않은 DRK 패키지 형식입니다.');
        }

        // 보안 검증: 파일 크기 제한 (최대 500MB)
        if (packageData.length > 500 * 1024 * 1024) {
          throw new Error('패키지 크기가 너무 큽니다. (최대 500MB)');
        }

        // 보안 검증: 매니페스트 크기 제한
        const manifestLength = packageData.readUInt32LE(4);
        if (manifestLength > 10 * 1024 * 1024) { // 최대 10MB
          throw new Error('매니페스트 크기가 비정상적으로 큽니다.');
        }

        // 매니페스트 추출
        const manifestJson = packageData.subarray(8, 8 + manifestLength).toString();
        
        // 보안 검증: JSON 파싱 보호
        let manifest;
        try {
          manifest = JSON.parse(manifestJson);
        } catch (error) {
          throw new Error('매니페스트 JSON 파싱 실패: 손상된 패키지일 수 있습니다.');
        }

        // 보안 검증: 필수 필드 확인
        if (!manifest.type || !manifest.file_entries || !Array.isArray(manifest.file_entries)) {
          throw new Error('유효하지 않은 매니페스트 구조입니다.');
        }

        // 보안 검증: 파일 수 제한 (최대 10,000개)
        if (manifest.file_entries.length > 10000) {
          throw new Error('패키지 내 파일 수가 너무 많습니다. (최대 10,000개)');
        }
        
        console.log('Package manifest loaded:', manifest.type, manifest.file_count, 'files');
        
        // 파일 목록을 문서 형태로 변환
        const documents = manifest.file_entries.map((entry: any, index: number) => {
          // 보안 검증: 경로 탐색 공격 방지
          if (entry.path.includes('..') || entry.path.includes('\\') || path.isAbsolute(entry.path)) {
            throw new Error(`위험한 파일 경로가 감지되었습니다: ${entry.path}`);
          }

          // 보안 검증: 허용된 파일 확장자만 허용
          const allowedExtensions = ['.pdf', '.txt', '.md', '.json'];
          const ext = path.extname(entry.path).toLowerCase();
          if (!allowedExtensions.includes(ext)) {
            console.warn(`지원하지 않는 파일 형식: ${entry.path}`);
            return null;
          }

          const filename = path.basename(entry.path);
          const type = entry.path.includes('Main Manual') ? 'MM' :
                      entry.path.includes('Procedure') ? 'PR' :
                      entry.path.includes('Instruction') ? 'I' :
                      entry.path.includes('Form') ? 'F' : 'DOC';
          
          return {
            id: `doc-${index}`,
            title: filename.replace('.pdf', ''),
            type: type,
            path: entry.path,
            size: entry.size,
            hash: entry.hash
          };
        }).filter(Boolean); // null 값 제거
        
        return {
          manifest,
          documents
        };
      } catch (error) {
        console.error('Failed to extract package documents:', error);
        throw error;
      }
    });

    // 패키지에서 특정 PDF 파일 추출
    ipcMain.handle('extract-pdf-file', async (_, packagePath: string, filePath: string) => {
      try {
        console.log('Extracting PDF file:', filePath, 'from', packagePath);
        
        const packageData = fs.readFileSync(packagePath);
        
        // 매니페스트 추출
        const manifestLength = packageData.readUInt32LE(4);
        const manifestJson = packageData.subarray(8, 8 + manifestLength).toString();
        const manifest = JSON.parse(manifestJson);
        
        // 요청된 파일 찾기
        const fileEntry = manifest.file_entries.find((entry: any) => entry.path === filePath);
        if (!fileEntry) {
          throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
        }
        
        // 데이터 섹션에서 파일 추출
        const dataSection = packageData.subarray(8 + manifestLength);
        const compressedData = dataSection.subarray(
          fileEntry.offset || 0, 
          (fileEntry.offset || 0) + (fileEntry.compressedSize || 0)
        );
        
        // Zstd 압축 해제 (임시로 그대로 반환)
        // TODO: Zstd 압축 해제 구현
        const tempPath = path.join(app.getPath('temp'), `drk_${Date.now()}_${path.basename(filePath)}`);
        fs.writeFileSync(tempPath, new Uint8Array(compressedData));
        
        return tempPath;
      } catch (error) {
        console.error('Failed to extract PDF file:', error);
        throw error;
      }
    });

    // 문서 목록 (임시 - 호환성 유지)
    ipcMain.handle('get-document-list', async () => {
      // 임시 샘플 문서 목록
      return [
        {
          id: 'sample-1',
          title: '샘플 매뉴얼 1',
          type: 'MM',
          path: '/sample/manual1.pdf'
        },
        {
          id: 'sample-2',
          title: '샘플 절차서 1',
          type: 'PR',
          path: '/sample/procedure1.pdf'
        }
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