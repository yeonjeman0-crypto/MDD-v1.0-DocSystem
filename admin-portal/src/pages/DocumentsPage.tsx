import React, { useState } from 'react';
import { Layout, Row, Col, Button, message, Space } from 'antd';
import { 
  SyncOutlined, 
  DatabaseOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import { DocumentTree } from '../components/DocumentTree/DocumentTree';
import { DocumentViewer } from '../components/DocumentViewer/DocumentViewer';
import { documentApi } from '../services/documentApi';

const { Content } = Layout;

export const DocumentsPage: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDocumentSelect = (key: string, nodeData: any) => {
    setSelectedDocument(nodeData);
  };

  const handleImportToDatabase = async () => {
    try {
      setLoading(true);
      const result = await documentApi.importJsonToDatabase();
      message.success(`JSON 데이터 임포트 완료: 메인매뉴얼 ${result.mainManual}개, 절차서 ${result.procedures}개, 지침서 ${result.instructions}개, 서식 ${result.forms}개`);
    } catch (error) {
      console.error('Import failed:', error);
      message.error('JSON 데이터 임포트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateJson = async () => {
    try {
      setLoading(true);
      const result = await documentApi.validateJsonFiles();
      if (result.isValid) {
        message.success('JSON 파일 검증 완료: 모든 파일이 유효합니다.');
      } else {
        message.warning(`JSON 파일 검증 완료: ${result.errors.length}개의 오류가 발견되었습니다.`);
        console.log('Validation errors:', result.errors);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('JSON 파일 검증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1>📚 MDD 문서 관리 시스템</h1>
          <Space>
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={handleValidateJson}
              loading={loading}
            >
              JSON 검증
            </Button>
            <Button 
              icon={<DatabaseOutlined />}
              onClick={handleImportToDatabase}
              loading={loading}
            >
              데이터베이스 임포트
            </Button>
            <Button 
              icon={<SyncOutlined />}
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </Space>
        </div>

        <Row gutter={24} style={{ height: 'calc(100vh - 160px)' }}>
          <Col span={8}>
            <div style={{ 
              height: '100%', 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px',
              overflow: 'auto',
              padding: '16px'
            }}>
              <DocumentTree onDocumentSelect={handleDocumentSelect} />
            </div>
          </Col>
          
          <Col span={16}>
            <div style={{ 
              height: '100%', 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px',
              overflow: 'auto'
            }}>
              <DocumentViewer documentData={selectedDocument} />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};