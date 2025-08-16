import React, { useCallback, useState } from 'react';

interface DropZoneProps {
  onDrop: (filePath: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = React.memo(({ onDrop, children, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const drkFiles = files.filter(file => 
      file.name.endsWith('.drkpack') || file.name.endsWith('.drkdelta')
    );

    if (drkFiles.length > 0) {
      onDrop(drkFiles[0].path);
    } else {
      alert('DRK 패키지 파일(.drkpack 또는 .drkdelta)만 지원됩니다.');
    }
  }, [onDrop]);

  return (
    <div
      className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
        <div className="drop-overlay">
          <div className="drop-message">
            <h3>📦 DRK 패키지 드롭</h3>
            <p>파일을 여기에 놓으세요</p>
          </div>
        </div>
      )}
    </div>
  );
});