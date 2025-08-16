import React, { useState } from 'react';
import { Layout, Row, Col, Button, message, Space, Upload, Modal, Form, Input, Select, Card, Typography, Tabs } from 'antd';
import { 
  SyncOutlined, 
  DatabaseOutlined, 
  CheckCircleOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  FolderOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DocumentTree } from '../components/DocumentTree/DocumentTree';
import { DocumentViewer } from '../components/DocumentViewer/DocumentViewer';
import { documentApi } from '../services/documentApi';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('browser');
  const [uploadForm] = Form.useForm();

  const handleDocumentSelect = (_key: string, nodeData: any) => {
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

  const handleFileUpload = async (values: any) => {
    try {
      setLoading(true);
      message.success('파일 업로드 성공');
      setUploadModalVisible(false);
      uploadForm.resetFields();
    } catch (error) {
      message.error('파일 업로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.doc,.docx',
    beforeUpload: () => false, // 자동 업로드 방지
    onChange: (info: any) => {
      console.log('File upload info:', info);
    }
  };

  const renderBrowserTab = () => (
    <Row gutter={24} style={{ height: 'calc(100vh - 200px)' }}>
      <Col span={8}>
        <Card title="📁 문서 트리" size="small" style={{ height: '100%' }}>
          <div style={{ 
            height: 'calc(100% - 60px)', 
            overflow: 'auto'
          }}>
            <DocumentTree onDocumentSelect={handleDocumentSelect} />
          </div>
        </Card>
      </Col>
      
      <Col span={16}>
        <Card title="📄 문서 뷰어" size="small" style={{ height: '100%' }}>
          <div style={{ 
            height: 'calc(100% - 60px)', 
            overflow: 'auto'
          }}>
            <DocumentViewer documentData={selectedDocument} />
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderUploadTab = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Card title="📤 파일 업로드" extra={<CloudUploadOutlined />}>
          <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
            <p className="ant-upload-drag-icon">
              <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              클릭하거나 파일을 드래그하여 업로드하세요
            </p>
            <p className="ant-upload-hint">
              PDF, DOC, DOCX 파일을 지원합니다 (최대 100MB)
            </p>
          </Upload.Dragger>
          
          <Form
            form={uploadForm}
            layout="vertical"
            onFinish={handleFileUpload}
          >
            <Form.Item
              name="category"
              label="문서 카테고리"
              rules={[{ required: true, message: '카테고리를 선택하세요' }]}
            >
              <Select placeholder="카테고리 선택">
                <Select.Option value="manual">매뉴얼</Select.Option>
                <Select.Option value="procedure">절차서</Select.Option>
                <Select.Option value="instruction">지침서</Select.Option>
                <Select.Option value="form">서식</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="title"
              label="문서 제목"
              rules={[{ required: true, message: '제목을 입력하세요' }]}
            >
              <Input placeholder="문서 제목 입력" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="설명"
            >
              <Input.TextArea rows={3} placeholder="문서 설명 입력" />
            </Form.Item>
            
            <Form.Item
              name="version"
              label="버전"
            >
              <Input placeholder="예: v1.0.0" />
            </Form.Item>
            
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              icon={<UploadOutlined />}
            >
              업로드
            </Button>
          </Form>
        </Card>
      </Col>
      
      <Col span={12}>
        <Card title="📊 업로드 통계">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small">
              <Text strong>최근 업로드</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">아직 업로드된 파일이 없습니다.</Text>
              </div>
            </Card>
            
            <Card size="small">
              <Text strong>지원 형식</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  <Text code>.pdf</Text>
                  <Text code>.doc</Text>
                  <Text code>.docx</Text>
                </Space>
              </div>
            </Card>
            
            <Card size="small">
              <Text strong>업로드 제한</Text>
              <div style={{ marginTop: 8 }}>
                <Text>최대 파일 크기: 100MB</Text>
                <br />
                <Text>동시 업로드: 최대 10개 파일</Text>
              </div>
            </Card>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>📚 {t('documents.title')}</Title>
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

        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={<span><FolderOutlined />문서 브라우저</span>} key="browser">
            {renderBrowserTab()}
          </TabPane>
          <TabPane tab={<span><UploadOutlined />파일 업로드</span>} key="upload">
            {renderUploadTab()}
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};