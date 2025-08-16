import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

interface AdvancedPDFViewerProps {
  pdfFile: string;
  onLoadSuccess?: (numPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
}

interface Annotation {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type: 'highlight' | 'note' | 'bookmark';
  timestamp: Date;
}

interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  timestamp: Date;
}

export const AdvancedPDFViewer: React.FC<AdvancedPDFViewerProps> = ({
  pdfFile,
  onLoadSuccess,
  onPageChange
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<'select' | 'highlight' | 'note'>('select');
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onLoadSuccess?.(numPages);
  }, [onLoadSuccess]);

  const changePage = useCallback((offset: number) => {
    const newPage = Math.min(Math.max(pageNumber + offset, 1), numPages);
    setPageNumber(newPage);
    onPageChange?.(newPage);
  }, [pageNumber, numPages, onPageChange]);

  const goToPage = useCallback((page: number) => {
    const newPage = Math.min(Math.max(page, 1), numPages);
    setPageNumber(newPage);
    onPageChange?.(newPage);
  }, [numPages, onPageChange]);

  const changeScale = useCallback((newScale: number) => {
    setScale(Math.min(Math.max(newScale, 0.25), 5.0));
  }, []);

  const rotateDocument = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    // TODO: PDF.js 텍스트 검색 구현
    console.log('Searching for:', text);
  }, []);

  const addBookmark = useCallback(() => {
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      pageNumber,
      title: `페이지 ${pageNumber}`,
      timestamp: new Date()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  }, [pageNumber]);

  const addAnnotation = useCallback((type: 'highlight' | 'note', x: number, y: number, width: number, height: number, text: string = '') => {
    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      pageNumber,
      x,
      y,
      width,
      height,
      text,
      type,
      timestamp: new Date()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  }, [pageNumber]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (selectedTool !== 'select') {
      setIsSelecting(true);
      const rect = pageRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, [selectedTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionStart) {
      const rect = pageRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        setCurrentSelection({
          x: Math.min(selectionStart.x, currentX),
          y: Math.min(selectionStart.y, currentY),
          width: Math.abs(currentX - selectionStart.x),
          height: Math.abs(currentY - selectionStart.y)
        });
      }
    }
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && currentSelection && selectionStart) {
      if (selectedTool === 'highlight') {
        addAnnotation('highlight', currentSelection.x, currentSelection.y, currentSelection.width, currentSelection.height);
      } else if (selectedTool === 'note') {
        const noteText = prompt('주석 내용을 입력하세요:');
        if (noteText) {
          addAnnotation('note', currentSelection.x, currentSelection.y, currentSelection.width, currentSelection.height, noteText);
        }
      }
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  }, [isSelecting, currentSelection, selectionStart, selectedTool, addAnnotation]);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(bm => bm.id !== id));
  }, []);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            changeScale(scale + 0.25);
            break;
          case '-':
            e.preventDefault();
            changeScale(scale - 0.25);
            break;
          case '0':
            e.preventDefault();
            changeScale(1.0);
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'r':
            e.preventDefault();
            rotateDocument();
            break;
          case 'b':
            e.preventDefault();
            addBookmark();
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowLeft':
          case 'PageUp':
            e.preventDefault();
            changePage(-1);
            break;
          case 'ArrowRight':
          case 'PageDown':
            e.preventDefault();
            changePage(1);
            break;
          case 'Home':
            e.preventDefault();
            goToPage(1);
            break;
          case 'End':
            e.preventDefault();
            goToPage(numPages);
            break;
          case 'Escape':
            if (isFullscreen) {
              toggleFullscreen();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, changeScale, changePage, goToPage, numPages, isFullscreen, toggleFullscreen, rotateDocument, addBookmark]);

  const currentPageAnnotations = annotations.filter(ann => ann.pageNumber === pageNumber);
  const currentPageBookmarks = bookmarks.filter(bm => bm.pageNumber === pageNumber);

  return (
    <div ref={containerRef} className={`advanced-pdf-viewer ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 도구 모음 */}
      <div className="pdf-toolbar">
        <div className="toolbar-section">
          <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} title="이전 페이지 (←)">
            ⬅️
          </button>
          <input
            type="number"
            value={pageNumber}
            onChange={(e) => goToPage(parseInt(e.target.value))}
            min={1}
            max={numPages}
            className="page-input"
          />
          <span className="page-total">/ {numPages}</span>
          <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} title="다음 페이지 (→)">
            ➡️
          </button>
        </div>

        <div className="toolbar-section">
          <button onClick={() => changeScale(scale - 0.25)} title="축소 (Ctrl+-)">🔍-</button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={() => changeScale(scale + 0.25)} title="확대 (Ctrl++)">🔍+</button>
          <button onClick={() => changeScale(1.0)} title="실제 크기 (Ctrl+0)">100%</button>
        </div>

        <div className="toolbar-section">
          <button 
            className={selectedTool === 'select' ? 'active' : ''}
            onClick={() => setSelectedTool('select')}
            title="선택 도구"
          >
            🖱️
          </button>
          <button 
            className={selectedTool === 'highlight' ? 'active' : ''}
            onClick={() => setSelectedTool('highlight')}
            title="형광펜"
          >
            🖍️
          </button>
          <button 
            className={selectedTool === 'note' ? 'active' : ''}
            onClick={() => setSelectedTool('note')}
            title="주석"
          >
            📝
          </button>
          <button onClick={addBookmark} title="북마크 추가 (Ctrl+B)">🔖</button>
        </div>

        <div className="toolbar-section">
          <button onClick={rotateDocument} title="회전 (Ctrl+R)">🔄</button>
          <button onClick={toggleFullscreen} title="전체화면 (Ctrl+F)">⛶</button>
        </div>

        <div className="toolbar-section">
          <input
            type="text"
            placeholder="문서 내 검색..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="toolbar-section">
          <button 
            className={showAnnotations ? 'active' : ''}
            onClick={() => setShowAnnotations(!showAnnotations)}
            title="주석 표시/숨김"
          >
            💬 ({annotations.length})
          </button>
          <button 
            className={showBookmarks ? 'active' : ''}
            onClick={() => setShowBookmarks(!showBookmarks)}
            title="북마크 표시/숨김"
          >
            📚 ({bookmarks.length})
          </button>
        </div>
      </div>

      <div className="pdf-content">
        {/* 사이드바 */}
        {(showBookmarks || (showAnnotations && annotations.length > 0)) && (
          <div className="pdf-sidebar">
            {showBookmarks && (
              <div className="bookmarks-panel">
                <h3>📚 북마크</h3>
                {bookmarks.map(bookmark => (
                  <div key={bookmark.id} className="bookmark-item">
                    <span onClick={() => goToPage(bookmark.pageNumber)} className="bookmark-link">
                      📄 {bookmark.title}
                    </span>
                    <button onClick={() => removeBookmark(bookmark.id)} className="remove-btn">❌</button>
                  </div>
                ))}
              </div>
            )}

            {showAnnotations && annotations.length > 0 && (
              <div className="annotations-panel">
                <h3>💬 주석</h3>
                {annotations.map(annotation => (
                  <div key={annotation.id} className="annotation-item">
                    <div className="annotation-header">
                      <span className="annotation-type">
                        {annotation.type === 'highlight' ? '🖍️' : '📝'}
                      </span>
                      <span onClick={() => goToPage(annotation.pageNumber)} className="annotation-page">
                        페이지 {annotation.pageNumber}
                      </span>
                      <button onClick={() => removeAnnotation(annotation.id)} className="remove-btn">❌</button>
                    </div>
                    {annotation.text && <div className="annotation-text">{annotation.text}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDF 뷰어 */}
        <div className="pdf-viewer-container">
          <div 
            ref={pageRef}
            className="pdf-page-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Document
              file={pdfFile}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={<div className="loading">📄 PDF 로딩 중...</div>}
              error={<div className="error">❌ PDF 로드 실패</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                rotate={rotation}
                loading={<div className="loading">페이지 로딩 중...</div>}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>

            {/* 주석 오버레이 */}
            {showAnnotations && currentPageAnnotations.map(annotation => (
              <div
                key={annotation.id}
                className={`annotation-overlay ${annotation.type}`}
                style={{
                  position: 'absolute',
                  left: annotation.x * scale,
                  top: annotation.y * scale,
                  width: annotation.width * scale,
                  height: annotation.height * scale,
                }}
                title={annotation.text || annotation.type}
              />
            ))}

            {/* 현재 선택 영역 */}
            {currentSelection && (
              <div
                className="selection-overlay"
                style={{
                  position: 'absolute',
                  left: currentSelection.x,
                  top: currentSelection.y,
                  width: currentSelection.width,
                  height: currentSelection.height,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 상태바 */}
      <div className="pdf-statusbar">
        <span>도구: {selectedTool === 'select' ? '선택' : selectedTool === 'highlight' ? '형광펜' : '주석'}</span>
        <span>페이지: {pageNumber}/{numPages}</span>
        <span>확대: {Math.round(scale * 100)}%</span>
        <span>회전: {rotation}°</span>
        <span>주석: {annotations.length}개</span>
        <span>북마크: {bookmarks.length}개</span>
      </div>
    </div>
  );
};