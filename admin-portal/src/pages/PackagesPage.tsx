import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Upload,
  Modal,
  Form,
  Input,
  Progress,
  Tabs,
  Tag,
  Space,
  Typography,
  message,
  Spin,
  Descriptions
} from 'antd';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  FileZipOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd/es/upload';
import dayjs from 'dayjs';
import { packageApi } from '../services/packageApi';
import { PackageDashboard } from '../components/PackageDashboard';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface PackageInfo {
  filename: string;
  type: 'full' | 'delta';
  size: number;
  created_at: string;
  modified_at: string;
}

interface CreatePackageForm {
  sourceDir: string;
  metadata: {
    vessel?: string;
    description: string;
  };
}

export const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [form] = Form.useForm();

  // 패키지 목록 조회
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageApi.listPackages();
      setPackages(response.packages || []);
    } catch (error) {
      message.error('패키지 목록 조회 실패');
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트시 패키지 목록 조회
  useEffect(() => {
    fetchPackages();
  }, []);

  // 패키지 생성
  const handleCreatePackage = async (values: CreatePackageForm) => {
    try {
      setCreateLoading(true);
      setCreateProgress(10);

      await packageApi.createFullPackage(values);
      
      setCreateProgress(100);
      message.success('패키지 생성 완료');
      setCreateModalVisible(false);
      form.resetFields();
      await fetchPackages();
    } catch (error) {
      message.error('패키지 생성 실패');
      console.error('Failed to create package:', error);
    } finally {
      setCreateLoading(false);
      setCreateProgress(0);
    }
  };

  // 패키지 검증
  const handleVerifyPackage = async (file: File) => {
    try {
      setVerifyLoading(true);
      const response = await packageApi.verifyPackage(file);
      
      if (response.package.valid) {
        message.success('패키지 검증 성공');
      } else {
        message.error('패키지 검증 실패');
      }
      
      setVerifyModalVisible(false);
    } catch (error) {
      message.error('패키지 검증 중 오류 발생');
      console.error('Failed to verify package:', error);
    } finally {
      setVerifyLoading(false);
    }
  };

  // 패키지 다운로드
  const handleDownload = async (filename: string) => {
    try {
      await packageApi.downloadPackage(filename);
      message.success('다운로드 시작');
    } catch (error) {
      message.error('다운로드 실패');
      console.error('Failed to download package:', error);
    }
  };

  // 패키지 상세 정보 보기
  const handleViewDetails = (pkg: PackageInfo) => {
    setSelectedPackage(pkg);
  };

  // 업로드 설정
  const uploadProps: UploadProps = {
    name: 'package',
    multiple: false,
    accept: '.drkpack,.drkdelta',
    showUploadList: false,
    beforeUpload: (file) => {
      handleVerifyPackage(file);
      return false; // 자동 업로드 방지
    },
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<PackageInfo> = [
    {
      title: '파일명',
      dataIndex: 'filename',
      key: 'filename',
      render: (filename: string, record: PackageInfo) => (
        <Space>
          <FileZipOutlined />
          <Text strong>{filename}</Text>
          <Tag color={record.type === 'full' ? 'blue' : 'green'}>
            {record.type === 'full' ? '전체' : '증분'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '크기',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '생성일시',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '수정일시',
      dataIndex: 'modified_at',
      key: 'modified_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record: PackageInfo) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.filename)}
          >
            다운로드
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            상세보기
          </Button>
        </Space>
      ),
    },
  ];

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            📦 DRK 패키지 관리
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPackages}
              loading={loading}
            >
              새로고침
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              패키지 생성
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => setVerifyModalVisible(true)}
            >
              패키지 검증
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        <Card>
          <Tabs 
            defaultActiveKey="dashboard"
            items={[
              {
                key: 'dashboard',
                label: '대시보드',
                children: <PackageDashboard />
              },
              {
                key: 'list',
                label: '패키지 목록',
                children: (
                  <Table
                    columns={columns}
                    dataSource={packages}
                    rowKey="filename"
                    loading={loading}
                    pagination={{
                      total: packages.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `총 ${total}개 패키지`,
                    }}
                  />
                )
              },
              {
                key: 'stats',
                label: '통계',
                children: (
                  <div style={{ padding: '20px' }}>
                    <Descriptions title="패키지 통계" bordered>
                      <Descriptions.Item label="전체 패키지 수">{packages.length}</Descriptions.Item>
                      <Descriptions.Item label="전체 패키지">
                        {packages.filter(p => p.type === 'full').length}
                      </Descriptions.Item>
                      <Descriptions.Item label="증분 패키지">
                        {packages.filter(p => p.type === 'delta').length}
                      </Descriptions.Item>
                      <Descriptions.Item label="총 용량" span={2}>
                        {formatFileSize(packages.reduce((sum, p) => sum + p.size, 0))}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )
              }
            ]}
          />
        </Card>

        {/* 패키지 생성 모달 */}
        <Modal
          title="새 패키지 생성"
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            form.resetFields();
            setCreateProgress(0);
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreatePackage}
          >
            <Form.Item
              label="소스 디렉토리"
              name="sourceDir"
              rules={[{ required: true, message: '소스 디렉토리를 입력하세요' }]}
            >
              <Input placeholder="예: C:/Users/sicka/Desktop/MDD-v1.0-DocSystem/절차서 PDF/00_DRK Main Manual" />
            </Form.Item>

            <Form.Item
              label="선박명"
              name={['metadata', 'vessel']}
            >
              <Input placeholder="선박명 (선택사항)" />
            </Form.Item>

            <Form.Item
              label="설명"
              name={['metadata', 'description']}
              rules={[{ required: true, message: '패키지 설명을 입력하세요' }]}
            >
              <TextArea rows={3} placeholder="패키지에 대한 설명을 입력하세요" />
            </Form.Item>

            {createProgress > 0 && (
              <Form.Item>
                <Progress percent={createProgress} status="active" />
              </Form.Item>
            )}

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setCreateModalVisible(false)}>
                  취소
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createLoading}
                  icon={<CloudUploadOutlined />}
                >
                  패키지 생성
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 패키지 검증 모달 */}
        <Modal
          title="패키지 검증"
          open={verifyModalVisible}
          onCancel={() => setVerifyModalVisible(false)}
          footer={null}
        >
          <Spin spinning={verifyLoading}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Upload.Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <CheckCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">
                  클릭하거나 파일을 드래그하여 패키지를 검증하세요
                </p>
                <p className="ant-upload-hint">
                  .drkpack 또는 .drkdelta 파일만 지원됩니다
                </p>
              </Upload.Dragger>
            </div>
          </Spin>
        </Modal>

        {/* 패키지 상세정보 모달 */}
        <Modal
          title="패키지 상세정보"
          open={!!selectedPackage}
          onCancel={() => setSelectedPackage(null)}
          footer={[
            <Button key="close" onClick={() => setSelectedPackage(null)}>
              닫기
            </Button>,
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => selectedPackage && handleDownload(selectedPackage.filename)}
            >
              다운로드
            </Button>
          ]}
        >
          {selectedPackage && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="파일명">{selectedPackage.filename}</Descriptions.Item>
              <Descriptions.Item label="패키지 타입">
                <Tag color={selectedPackage.type === 'full' ? 'blue' : 'green'}>
                  {selectedPackage.type === 'full' ? '전체 패키지' : '증분 패키지'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="파일 크기">
                {formatFileSize(selectedPackage.size)}
              </Descriptions.Item>
              <Descriptions.Item label="생성일시">
                {dayjs(selectedPackage.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="수정일시">
                {dayjs(selectedPackage.modified_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};