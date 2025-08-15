import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/cjs/Page/AnnotationLayer.css';
import 'react-pdf/dist/cjs/Page/TextLayer.css';
import './App.css';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  path: string;
}

interface PackageInfo {
  name: string;
  size: number;
  type: 'full' | 'delta';
  lastModified: Date;
  path: string;
}

interface AppInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
}

const App: React.FC = () => {
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 앱 정보 로드
    window.electronAPI?.getAppInfo().then(setAppInfo);
    
    // 문서 목록 로드 (임시)
    window.electronAPI?.getDocumentList().then(setDocuments);
  }, []);

  const handleOpenPackage = async () => {
    setIsLoading(true);
    try {
      const filePath = await window.electronAPI?.openDRKPackage();
      if (filePath) {
        const info = await window.electronAPI?.readPackageInfo(filePath);
        if (info) {
          setPackageInfo(info);
          // TODO: 패키지에서 문서 목록 추출
          console.log('패키지 로드됨:', info);
        }
      }
    } catch (error) {
      console.error('패키지 열기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSelect = (document: DocumentItem) => {
    setSelectedDocument(document);
    // TODO: 실제 PDF 파일 로드
    setPdfFile('/sample.pdf'); // 임시
    setPageNumber(1);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages));
  };

  const changeScale = (newScale: number) => {
    setScale(Math.min(Math.max(newScale, 0.5), 3.0));
  };

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="app-header">
        <div className="header-left">
          <h1>🚢 DRK Document Viewer</h1>
          {appInfo && (
            <span className="version">v{appInfo.version}</span>
          )}
        </div>
        <div className="header-right">
          <button 
            className="btn-primary" 
            onClick={handleOpenPackage}
            disabled={isLoading}
          >
            {isLoading ? '로딩 중...' : '📦 DRK 패키지 열기'}
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* 사이드바 - 문서 목록 */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>📁 문서 목록</h3>
            {packageInfo && (
              <div className="package-info">
                <div className="package-name">{packageInfo.name}</div>
                <div className="package-type">
                  {packageInfo.type === 'full' ? '🎯 전체 패키지' : '📝 증분 패키지'}
                </div>
                <div className="package-size">
                  {(packageInfo.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            )}
          </div>
          
          <div className="document-list">
            {documents.map(doc => (
              <div
                key={doc.id}
                className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                onClick={() => handleDocumentSelect(doc)}
              >
                <div className="doc-type">{doc.type}</div>
                <div className="doc-title">{doc.title}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* 메인 뷰어 */}
        <main className="main-viewer">
          {selectedDocument ? (
            <div className="pdf-viewer">
              <div className="viewer-controls">
                <div className="page-controls">
                  <button 
                    onClick={() => changePage(-1)} 
                    disabled={pageNumber <= 1}
                  >
                    ← 이전
                  </button>
                  <span className="page-info">
                    {pageNumber} / {numPages}
                  </span>
                  <button 
                    onClick={() => changePage(1)} 
                    disabled={pageNumber >= numPages}
                  >
                    다음 →
                  </button>
                </div>
                
                <div className="zoom-controls">
                  <button onClick={() => changeScale(scale - 0.2)}>🔍-</button>
                  <span className="zoom-level">{Math.round(scale * 100)}%</span>
                  <button onClick={() => changeScale(scale + 0.2)}>🔍+</button>
                </div>
              </div>

              <div className="pdf-container">
                {pdfFile && (
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="loading">📄 PDF 로딩 중...</div>}
                    error={<div className="error">❌ PDF 로드 실패</div>}
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      loading={<div className="loading">페이지 로딩 중...</div>}
                    />
                  </Document>
                )}
              </div>
            </div>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <h2>🚢 DORIKO 문서 뷰어</h2>
                <p>해운업 특화 문서 관리 시스템</p>
                <div className="welcome-features">
                  <div className="feature">
                    <h4>📦 DRK 패키지 지원</h4>
                    <p>전체 패키지(.drkpack) 및 증분 패키지(.drkdelta) 지원</p>
                  </div>
                  <div className="feature">
                    <h4>🔒 보안 검증</h4>
                    <p>Ed25519 디지털 서명 및 무결성 검증</p>
                  </div>
                  <div className="feature">
                    <h4>⚡ 고성능</h4>
                    <p>Zstd 압축 및 백그라운드 인덱싱</p>
                  </div>
                </div>
                <button className="btn-primary large" onClick={handleOpenPackage}>
                  📦 DRK 패키지 열기
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 상태바 */}
      <footer className="status-bar">
        <div className="status-left">
          {selectedDocument && (
            <span>📄 {selectedDocument.title}</span>
          )}
        </div>
        <div className="status-right">
          <span>🖥️ {appInfo?.platform} {appInfo?.arch}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;