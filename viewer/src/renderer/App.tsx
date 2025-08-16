import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/cjs/Page/AnnotationLayer.css';
import 'react-pdf/dist/cjs/Page/TextLayer.css';
import { DropZone } from './components/DropZone';
import { SearchBox } from './components/SearchBox';
import { AdvancedPDFViewer } from './components/AdvancedPDFViewer';
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 검색 필터링된 문서 목록
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.type.toLowerCase().includes(query) ||
      doc.path.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  useEffect(() => {
    // 앱 정보 로드
    window.electronAPI?.getAppInfo().then(setAppInfo);
    
    // 문서 목록 로드 (임시)
    window.electronAPI?.getDocumentList().then(setDocuments);
  }, []);

  const loadPackage = async (filePath: string) => {
    setIsLoading(true);
    try {
      const info = await window.electronAPI?.readPackageInfo(filePath);
      if (info) {
        setPackageInfo(info);
        
        // DRK 패키지에서 문서 목록 추출
        try {
          const packageData = await window.electronAPI?.extractPackageDocuments(filePath);
          if (packageData?.documents) {
            setDocuments(packageData.documents);
            console.log('패키지 문서 목록:', packageData.documents.length, '개');
            console.log('매니페스트 정보:', packageData.manifest.type, packageData.manifest.version);
          }
        } catch (extractError) {
          console.error('문서 목록 추출 실패:', extractError);
          // 실패 시 기본 목록 사용
          const defaultDocs = await window.electronAPI?.getDocumentList();
          if (defaultDocs) setDocuments(defaultDocs);
        }
        
        console.log('패키지 로드 완료:', info);
        return true;
      }
    } catch (error) {
      console.error('패키지 로드 실패:', error);
      alert('패키지 로드에 실패했습니다: ' + error);
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleOpenPackage = async () => {
    try {
      const filePath = await window.electronAPI?.openDRKPackage();
      if (filePath) {
        await loadPackage(filePath);
      }
    } catch (error) {
      console.error('패키지 열기 실패:', error);
      alert('패키지 열기에 실패했습니다: ' + error);
    }
  };

  const handleDropPackage = async (filePath: string) => {
    await loadPackage(filePath);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDocumentSelect = useCallback(async (document: DocumentItem) => {
    setSelectedDocument(document);
    setIsLoading(true);
    
    try {
      if (packageInfo?.path) {
        // DRK 패키지에서 PDF 파일 추출
        const extractedPath = await window.electronAPI?.extractPdfFile(packageInfo.path, document.path);
        if (extractedPath) {
          setPdfFile(`file://${extractedPath}`);
          setPageNumber(1);
          console.log('PDF 추출 완료:', extractedPath);
        } else {
          console.error('PDF 추출 실패');
          alert('PDF 파일을 추출할 수 없습니다.');
        }
      } else {
        // 패키지 없이 임시 파일 사용
        setPdfFile('/sample.pdf');
        setPageNumber(1);
      }
    } catch (error) {
      console.error('PDF 로드 실패:', error);
      alert('PDF 로드에 실패했습니다: ' + error);
    } finally {
      setIsLoading(false);
    }
  }, [packageInfo?.path]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const changePage = useCallback((offset: number) => {
    setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages));
  }, [numPages]);

  const changeScale = useCallback((newScale: number) => {
    setScale(Math.min(Math.max(newScale, 0.5), 3.0));
  }, []);

  return (
    <DropZone onDrop={handleDropPackage} className="app">
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
            <div className="search-container">
              <SearchBox onSearch={handleSearch} />
            </div>
          </div>
          
          <div className="document-list">
            {filteredDocuments.length === 0 ? (
              <div className="no-documents">
                {searchQuery ? '검색 결과가 없습니다' : '문서가 없습니다'}
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => handleDocumentSelect(doc)}
                >
                  <div className="doc-type">{doc.type}</div>
                  <div className="doc-title">{doc.title}</div>
                </div>
              ))
            )}
            {searchQuery && (
              <div className="search-results-summary">
                {filteredDocuments.length}개 문서 발견
              </div>
            )}
          </div>
        </aside>

        {/* 메인 뷰어 */}
        <main className="main-viewer">
          {selectedDocument ? (
            pdfFile && (
              <AdvancedPDFViewer 
                pdfFile={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onPageChange={(page) => setPageNumber(page)}
              />
            )
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
    </DropZone>
  );
};

export default App;