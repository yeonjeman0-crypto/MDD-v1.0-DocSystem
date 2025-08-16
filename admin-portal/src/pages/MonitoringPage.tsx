import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Alert,
  Spin,
  Typography,
  Descriptions,
  Space,
  Divider,
} from 'antd';
import {
  DashboardOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  FileSearchOutlined,
  EyeOutlined,
  HddOutlined,
  ApiOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { monitoringApi, DashboardData, HealthStatus } from '../services/monitoringApi';

const { Title, Text } = Typography;

export const MonitoringPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboard, health] = await Promise.all([
        monitoringApi.getDashboardData(),
        monitoringApi.getHealthStatus(),
      ]);
      setDashboardData(dashboard);
      setHealthStatus(health);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}일 ${hours}시 ${minutes}분`;
  };

  const formatMemory = (bytes: number): string => {
    return `${Math.round(bytes / 1024 / 1024)} MB`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'ready':
        return 'success';
      case 'unhealthy':
      case 'down':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'ready':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'unhealthy':
      case 'down':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>모니터링 데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <DashboardOutlined /> 시스템 모니터링
        </Title>
        <Space>
          <Text type="secondary">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </Text>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={loadData}
            loading={loading}
          >
            새로고침
          </Button>
        </Space>
      </div>

      {/* Health Status Alert */}
      {healthStatus && (
        <Alert
          message={
            <Space>
              {getStatusIcon(healthStatus.status)}
              <span>시스템 상태: {healthStatus.status === 'healthy' ? '정상' : '비정상'}</span>
            </Space>
          }
          type={getStatusColor(healthStatus.status) as any}
          showIcon={false}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* System Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="시스템 가동시간"
              value={dashboardData ? formatUptime(dashboardData.uptime) : '-'}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="메모리 사용량"
              value={dashboardData ? formatMemory(dashboardData.memory.used) : 0}
              suffix="MB"
              prefix={<HddOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            {dashboardData && (
              <Progress
                percent={Math.round((dashboardData.memory.used / dashboardData.memory.total) * 100)}
                size="small"
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="HTTP 요청 수"
              value={dashboardData?.metrics.http.totalRequests || 0}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="검색 요청 수"
              value={dashboardData?.metrics.search.totalSearches || 0}
              prefix={<FileSearchOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><ApiOutlined /> HTTP 성능</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="총 요청 수">
                {dashboardData?.metrics.http.totalRequests || 0}
              </Descriptions.Item>
              <Descriptions.Item label="평균 응답시간">
                {dashboardData?.metrics.http.avgResponseTime || 0}ms
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><FileSearchOutlined /> 검색 성능</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="검색 요청 수">
                {dashboardData?.metrics.search.totalSearches || 0}
              </Descriptions.Item>
              <Descriptions.Item label="평균 응답시간">
                {dashboardData?.metrics.search.avgResponseTime || 0}ms
              </Descriptions.Item>
              <Descriptions.Item label="인덱스 크기">
                {dashboardData?.metrics.search.indexSize || 0} 문서
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><EyeOutlined /> OCR 성능</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="OCR 요청 수">
                {dashboardData?.metrics.ocr.totalRequests || 0}
              </Descriptions.Item>
              <Descriptions.Item label="평균 처리시간">
                {dashboardData?.metrics.ocr.avgProcessingTime || 0}초
              </Descriptions.Item>
              <Descriptions.Item label="평균 신뢰도">
                {dashboardData?.metrics.ocr.avgConfidence || 0}%
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📄 문서 현황">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="인덱싱된 문서">
                {dashboardData?.metrics.documents.indexed || 0}
              </Descriptions.Item>
              <Descriptions.Item label="전체 문서">
                {dashboardData?.metrics.documents.total || 0}
              </Descriptions.Item>
              <Descriptions.Item label="생성된 패키지">
                {dashboardData?.metrics.packages.created || 0}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Service Status */}
      {healthStatus && (
        <Card title={<><HeartOutlined /> 서비스 상태</> }>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  {getStatusIcon(healthStatus.services.database)}
                  <div style={{ marginTop: 8 }}>
                    <Text strong>데이터베이스</Text>
                    <br />
                    <Tag color={getStatusColor(healthStatus.services.database)}>
                      {healthStatus.services.database === 'up' ? '정상' : '중단'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  {getStatusIcon(healthStatus.services.elasticsearch)}
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Elasticsearch</Text>
                    <br />
                    <Tag color={getStatusColor(healthStatus.services.elasticsearch)}>
                      {healthStatus.services.elasticsearch === 'up' ? '정상' : '중단'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  {getStatusIcon(healthStatus.services.filesystem)}
                  <div style={{ marginTop: 8 }}>
                    <Text strong>파일시스템</Text>
                    <br />
                    <Tag color={getStatusColor(healthStatus.services.filesystem)}>
                      {healthStatus.services.filesystem === 'up' ? '정상' : '중단'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};