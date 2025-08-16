import React, { useState } from 'react';
import { Card, Typography, Tag, Descriptions, Empty, Button, Tabs, Alert } from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  TagOutlined,
  BookOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface DocumentViewerProps {
  documentData: any;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentData }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'pdf') {
      setPdfLoading(true);
    }
  };

  if (!documentData) {
    return (
      <Card style={{ height: '100%' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="문서를 선택해주세요"
        />
      </Card>
    );
  }

  const renderDocumentInfo = () => {
    const { section, code, title_ko, title_en, type, procedureCode, pr_code } = documentData;

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined />
            <span>{title_ko}</span>
          </div>
        }
        extra={<Tag color="blue">{section}</Tag>}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="문서 코드">
            <Text code>{code}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="한글 제목">
            <Text strong>{title_ko}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="영문 제목">
            <Text italic>{title_en}</Text>
          </Descriptions.Item>

          {type && (
            <Descriptions.Item label="문서 유형">
              <Tag>{type}</Tag>
            </Descriptions.Item>
          )}

          {procedureCode && (
            <Descriptions.Item label="소속 절차서">
              <Tag color="green">{procedureCode}</Tag>
            </Descriptions.Item>
          )}

          {pr_code && (
            <Descriptions.Item label="연관 절차서">
              <Tag color="orange">{pr_code}</Tag>
            </Descriptions.Item>
          )}

          {documentData.vessel_type && (
            <Descriptions.Item label="선박 유형">
              <Tag color="purple">{documentData.vessel_type}</Tag>
            </Descriptions.Item>
          )}

          {documentData.date && (
            <Descriptions.Item label="발행일">
              <Text>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {documentData.date}
              </Text>
            </Descriptions.Item>
          )}

          {documentData.categories && documentData.categories.length > 0 && (
            <Descriptions.Item label="카테고리">
              <div>
                {documentData.categories.map((category: string, index: number) => (
                  <Tag key={index} icon={<TagOutlined />} style={{ marginBottom: 4 }}>
                    {category}
                  </Tag>
                ))}
              </div>
            </Descriptions.Item>
          )}

          {documentData.revision && (
            <Descriptions.Item label="개정 번호">
              <Tag color="cyan">{documentData.revision}</Tag>
            </Descriptions.Item>
          )}

          {documentData.latest !== undefined && (
            <Descriptions.Item label="최신 버전">
              <Tag color={documentData.latest ? 'green' : 'default'}>
                {documentData.latest ? '최신' : '이전 버전'}
              </Tag>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Title level={5}>
            <BookOutlined style={{ marginRight: 8 }} />
            문서 경로
          </Title>
          <Text code style={{ fontSize: 12 }}>
            {getDocumentPath(documentData)}
          </Text>
        </div>

        <div style={{ marginTop: 16 }}>
          <Title level={5}>연관 작업</Title>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => handleTabChange('pdf')}
            >
              PDF 보기
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload()}
            >
              다운로드
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderPdfViewer = () => {
    const pdfPath = getDocumentPath(documentData);
    
    // Handle special cases where files are not PDFs or paths are complex
    if (pdfPath === 'NOT_PDF_FILE') {
      return (
        <Card title="파일 미리보기" style={{ height: '100%' }}>
          <Alert
            message="PDF 파일이 아님"
            description={`이 문서는 PDF 파일이 아닙니다. Forms 섹션의 파일들은 주로 DOC, DOCX, XLS 형식입니다.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text type="secondary">
            파일 형식: DOC/DOCX/XLS<br/>
            실제 경로: /03_DRK Form/{documentData.pr_code || 'Unknown'}/
          </Text>
        </Card>
      );
    }
    
    if (pdfPath.startsWith('COMPLEX_INSTRUCTION_FILE:')) {
      const pathInfo = pdfPath.replace('COMPLEX_INSTRUCTION_FILE:', '');
      return (
        <Card title="지침서 파일" style={{ height: '100%' }}>
          <Alert
            message="복잡한 파일 구조"
            description="지침서 파일들은 년도별/카테고리별로 복잡하게 구성되어 있어 자동 매핑이 어렵습니다."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text type="secondary">
            예상 경로: /02_DRK Instruction/{pathInfo}<br/>
            파일명은 제목을 포함하여 더 복잡할 수 있습니다.
          </Text>
        </Card>
      );
    }
    
    if (pdfPath.startsWith('INSTRUCTION_FILE_NOT_MAPPED:')) {
      const code = pdfPath.replace('INSTRUCTION_FILE_NOT_MAPPED:', '');
      return (
        <Card title="지침서 파일" style={{ height: '100%' }}>
          <Alert
            message="매핑되지 않은 지침서"
            description="이 지침서 코드에 대한 파일 경로를 찾을 수 없습니다."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text type="secondary">
            문서 코드: {code}<br/>
            /02_DRK Instruction/ 폴더에서 수동으로 확인이 필요합니다.
          </Text>
        </Card>
      );
    }
    
    // Regular PDF handling
    const encodedPath = pdfPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const pdfUrl = `http://localhost:3003${encodedPath}`;
    
    return (
      <Card title="PDF 미리보기" style={{ height: '100%' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            PDF 경로: {pdfPath}
          </Text>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownload()}
            size="small"
          >
            다운로드
          </Button>
        </div>
        
        {pdfLoading && (
          <Alert
            message="PDF 로딩 중..."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <div style={{ 
          height: '600px', 
          border: '1px solid #d9d9d9', 
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={`PDF: ${documentData.title_ko}`}
            onLoad={() => setPdfLoading(false)}
            onError={() => {
              setPdfLoading(false);
              console.error('PDF 로딩 실패:', pdfUrl);
            }}
          />
        </div>
      </Card>
    );
  };

  const handleDownload = () => {
    const pdfPath = getDocumentPath(documentData);
    
    // Handle special cases
    if (pdfPath === 'NOT_PDF_FILE' || pdfPath.startsWith('COMPLEX_INSTRUCTION_FILE:') || pdfPath.startsWith('INSTRUCTION_FILE_NOT_MAPPED:')) {
      alert('이 문서는 PDF 파일이 아니거나 경로 매핑이 복잡하여 다운로드할 수 없습니다.');
      return;
    }
    
    // Properly encode each path segment to handle Korean characters and special chars
    const encodedPath = pdfPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const pdfUrl = `http://localhost:3003${encodedPath}`;
    
    // 새 탭에서 PDF 열기 (브라우저에서 다운로드 옵션 제공)
    window.open(pdfUrl, '_blank');
    
    // 또는 직접 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${documentData.code}. ${documentData.title_ko}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentPath = (data: any) => {
    const { section, procedureCode, code, pr_code, vesselType, type } = data;
    
    if (section === 'main-manual') {
      // Main Manual files have different naming patterns based on type
      if (type === 'front') {
        return `/pdf/00_DRK Main Manual/0. 표지(Cover Letter).pdf`;
      } else if (type === 'forms') {
        // Forms: 01. F-1 목차(Index).pdf, 02. F-2 개정이력(Revision History).pdf
        const formNumber = code.replace('F-', '');
        const paddedNumber = formNumber.padStart(2, '0');
        
        // Special mappings for titles that don't match exactly
        const titleMap: Record<string, string> = {
          'F-1': '목차(Index)',
          'F-2': '개정이력(Revision History)',
          'F-3': '사명 및 비전(Mission & Vision of Company)',
          'F-4': '회사의 장기 목표(Long-Term Objective of Company)',
          'F-5': '회사의 안전, 보건, 품질 및 환경보호 방침(SHQE Policy of Company)',
          'F-6': '마약 및 알코올 통제 방침(Drug & Alcohol Control Policy)',
          'F-7': '2025 년간 안전 품질 환경 경영 목표(Annual SHQE Management Objective)',
          'F-8': '윤리경영 방침(Corporate Policy of Ethical Management)'
        };
        
        const titlePart = titleMap[code] || `${data.title_ko}(${data.title_en})`;
        return `/pdf/00_DRK Main Manual/${paddedNumber}. ${code} ${titlePart}.pdf`;
      } else if (type === 'chapters') {
        // Chapters: 09. 1장 일반사항(General).pdf, 10. 2장 책임과 권한(Responsibility and Authority).pdf
        const chapterNumber = code.replace('CH.', '');
        const paddedNumber = (parseInt(chapterNumber) + 8).toString().padStart(2, '0');
        return `/pdf/00_DRK Main Manual/${paddedNumber}. ${chapterNumber}장 ${data.title_ko}(${data.title_en}).pdf`;
      } else if (type === 'appendices') {
        // Handle missing APP.3 and existing appendices
        const appNumber = code.replace('APP.', '').trim();
        
        // Special mappings for actual appendix file names
        const appendixMap: Record<string, string> = {
          '1': '17. APP. 1 프로세스 상호관계(Process Interrelation).pdf',
          '2': '18. APP. 2 프로세스 분류(Process Classfication).pdf',
          '4': '20. APP. 4 조직 업무 분장표(Work Response Table).pdf',
          '5': '21. App. 5 주요용어의 정의(Definition of Major Terms).pdf',
          '6': '22. App. 6 모니터링 및 측정 주기(Period of Monitoring and measurement).pdf'
        };
        
        if (appendixMap[appNumber]) {
          return `/pdf/00_DRK Main Manual/${appendixMap[appNumber]}`;
        }
        
        // Fallback for unknown appendices
        const paddedNumber = (parseInt(appNumber) + 16).toString().padStart(2, '0');
        return `/pdf/00_DRK Main Manual/${paddedNumber}. APP. ${appNumber} ${data.title_ko}(${data.title_en}).pdf`;
      }
      // Fallback
      return `/pdf/00_DRK Main Manual/${code}. ${data.title_ko}.pdf`;
    } else if (section === 'procedures') {
      // Handle vessel-specific folder names for DRK-PR09
      if (procedureCode === 'DRK-PR09' && vesselType) {
        const folderMap: Record<string, string> = {
          'Bulk Carrier': '9. PR-09 (벌크 화물관리 CARGO HANDLING FOR BULK CARRIER)',
          'PCTC': '9. PR-09 (자동차운반선 화물관리 CARGO HANDLING FOR PCTC)'
        };
        const folderName = folderMap[vesselType] || `9. ${procedureCode}`;
        return `/pdf/01_DRK Procedure/${folderName}/${code}. ${data.title_ko}.pdf`;
      }
      // Generate proper file number with leading zeros and handle special cases
      const codeToNumber: Record<string, string> = {
        '00': '000',
        'F-1': '001', 
        'F-2': '002',
        'CH.1': '003',
        'CH.2': '004', 
        'CH.3': '005',
        'CH.4': '006',
        'CH.5': '007',
        'CH.6': '008',
        'CH.7': '009',
        'APP.1': '010'
      };
      
      const fileNumber = codeToNumber[code] || code;
      return `/pdf/01_DRK Procedure/${procedureCode}/${fileNumber}. ${data.title_ko}.pdf`;
    } else if (section === 'instructions') {
      // Instructions have a complex hierarchical structure with year-based folders
      // Extract year from code (e.g., I-01-SQT-16-008 -> 2016, I-01-22-001 -> 2022)
      const year = extractYearFromInstructionCode(code);
      const categoryCode = code.split('-')[1]; // I-01, I-02, etc.
      
      if (year && categoryCode) {
        const categoryMap: Record<string, string> = {
          '01': 'I-01 사고속보 (INCIDENT PRESS)',
          '02': 'I-02 해사정보 (MARINE INFORMATION)',
          '03': 'I-03 기관정보 (TECHNICAL INFORMATION)',
          '04': 'I-04 항만정보 (PORT INFORMATION)',
          '05': 'I-05 업무연락 (OFFICIAL NOTICE)',
          '06': 'I-06 심사, 검사 정보 (AUDIT, INSPECTION INFORMATION)',
          '07': 'I-07 위험성평가서 (RISK ASSESSMENT SHEET)',
          '08': 'I-08 환경영향평가서 (ENVIRONMENTAL ASPECT INVESTIGATION SHEET)',
          '09': 'I-09 신규승선자 필수지침 (Essential Instruction for New Joined Crew)',
          '10': 'I-10 업무지시서 (Company instruction)'
        };
        
        const categoryName = categoryMap[categoryCode];
        if (categoryName) {
          // Some files have complex names with titles, try to find exact match
          // For now, indicate that file structure is too complex for automatic mapping
          return `COMPLEX_INSTRUCTION_FILE:${categoryName}/${year}/${code}`;
        }
      }
      
      // Fallback for codes that don't match the pattern
      return `INSTRUCTION_FILE_NOT_MAPPED:${code}`;
    } else if (section === 'forms') {
      // Forms are NOT PDF files - they are DOC/DOCX/XLS files
      // Return a special indicator that this is not a PDF
      return 'NOT_PDF_FILE';
    }
    
    return 'N/A';
  };

  const extractYearFromInstructionCode = (code: string): string | null => {
    if (!code) return null;
    
    // Pattern: I-01-SQT-16-008 -> extract "16" and convert to "2016"
    // Pattern: I-01-22-001 -> extract "22" and convert to "2022"
    const parts = code.split('-');
    
    if (parts.length >= 4) {
      const yearPart = parts[3];
      if (yearPart.length === 2) {
        const year = parseInt(yearPart);
        // Assume 00-30 means 2000-2030, 31-99 means 1931-1999
        return year <= 30 ? `20${yearPart}` : `19${yearPart}`;
      }
    } else if (parts.length >= 3) {
      const yearPart = parts[2];
      if (yearPart.length === 2) {
        const year = parseInt(yearPart);
        return year <= 30 ? `20${yearPart}` : `19${yearPart}`;
      }
    }
    
    return null;
  };

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <FileTextOutlined />
          문서 정보
        </span>
      ),
      children: renderDocumentInfo(),
    },
    {
      key: 'pdf',
      label: (
        <span>
          <EyeOutlined />
          PDF 미리보기
        </span>
      ),
      children: renderPdfViewer(),
    },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        style={{ height: '100%' }}
      />
    </div>
  );
};