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
    // Properly encode each path segment to handle Korean characters and special chars
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
    const { section, procedureCode, code, pr_code, vesselType } = data;
    
    if (section === 'main-manual') {
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
      return `/pdf/01_DRK Procedure/${procedureCode}/${code}. ${data.title_ko}.pdf`;
    } else if (section === 'instructions') {
      // Instructions have a hierarchical structure with year-based folders
      // Extract year from code (e.g., I-01-SQT-16-008 -> 2016, I-01-22-001 -> 2022)
      const year = extractYearFromInstructionCode(code);
      const categoryCode = code.split('-')[1]; // I-01, I-02, etc.
      
      if (year && categoryCode) {
        const categoryMap: Record<string, string> = {
          '01': '사고속보 (INCIDENT PRESS)',
          '02': '해사정보 (MARINE INFORMATION)',
          '03': '기관정보 (TECHNICAL INFORMATION)',
          '04': '항만정보 (PORT INFORMATION)',
          '05': '업무연락 (OFFICIAL NOTICE)',
          '06': '심사, 검사 정보 (AUDIT, INSPECTION INFORMATION)',
          '07': '위험성평가서 (RISK ASSESSMENT SHEET)',
          '08': '환경영향평가서 (ENVIRONMENTAL ASPECT INVESTIGATION SHEET)',
          '09': '신규승선자 필수지침 (Essential Instruction for New Joined Crew)',
          '10': '업무지시서 (Company instruction)'
        };
        
        const categoryName = categoryMap[categoryCode] || `I-${categoryCode}`;
        return `/pdf/02_DRK Instruction/${categoryName}/${year}/${code}.pdf`;
      }
      
      // Fallback for codes that don't match the pattern
      return `/pdf/02_DRK Instruction/${code}/${data.title_ko}.pdf`;
    } else if (section === 'forms') {
      return `/pdf/03_DRK Form/${pr_code}/${code}. ${data.title_ko}`;
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