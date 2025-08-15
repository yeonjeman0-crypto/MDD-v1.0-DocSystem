import React from 'react';
import { Card, Typography, Tag, Descriptions, Empty } from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  TagOutlined,
  BookOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface DocumentViewerProps {
  documentData: any;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentData }) => {
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
          <ul style={{ marginLeft: 16 }}>
            <li>PDF 파일 보기</li>
            <li>원본 파일 다운로드</li>
            <li>문서 히스토리 확인</li>
            <li>관련 서식 보기</li>
          </ul>
        </div>
      </Card>
    );
  };

  const getDocumentPath = (data: any) => {
    const { section, procedureCode, code, pr_code } = data;
    
    if (section === 'main-manual') {
      return `/절차서 PDF/00_DRK Main Manual/${code}. ${data.title_ko}.pdf`;
    } else if (section === 'procedures') {
      return `/절차서 PDF/01_DRK Procedure/${procedureCode}/${code}. ${data.title_ko}.pdf`;
    } else if (section === 'instructions') {
      return `/절차서 PDF/02_DRK Instruction/${code}/${data.title_ko}.pdf`;
    } else if (section === 'forms') {
      return `/절차서 PDF/03_DRK Form/${pr_code}/${code}. ${data.title_ko}`;
    }
    
    return 'N/A';
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {renderDocumentInfo()}
    </div>
  );
};