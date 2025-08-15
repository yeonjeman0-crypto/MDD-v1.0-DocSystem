import { contextBridge, ipcRenderer } from 'electron';

// 보안 컨텍스트 브리지 - 렌더러에서 사용할 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 패키지 관리
  openDRKPackage: () => ipcRenderer.invoke('open-drk-package'),
  readPackageInfo: (filePath: string) => ipcRenderer.invoke('read-package-info', filePath),
  
  // 문서 관리
  getDocumentList: () => ipcRenderer.invoke('get-document-list'),
  
  // 앱 정보
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // 플랫폼 정보
  platform: process.platform,
  
  // 이벤트 리스너
  onPackageLoaded: (callback: (packageInfo: any) => void) => 
    ipcRenderer.on('package-loaded', (_, data) => callback(data)),
  
  onDocumentSelected: (callback: (document: any) => void) => 
    ipcRenderer.on('document-selected', (_, data) => callback(data)),
});

// TypeScript를 위한 타입 선언
declare global {
  interface Window {
    electronAPI: {
      openDRKPackage: () => Promise<string | null>;
      readPackageInfo: (filePath: string) => Promise<any>;
      getDocumentList: () => Promise<any[]>;
      getAppInfo: () => Promise<any>;
      quitApp: () => Promise<void>;
      platform: string;
      onPackageLoaded: (callback: (packageInfo: any) => void) => void;
      onDocumentSelected: (callback: (document: any) => void) => void;
    };
  }
}

console.log('🔌 Preload script loaded - Electron API bridge ready');