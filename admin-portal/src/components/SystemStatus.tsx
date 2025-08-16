import React, { useState, useEffect } from 'react';
import { Card, Badge, Statistic, Row, Col, Button, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined, 
  ReloadOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  FileSearchOutlined
} from '@ant-design/icons';

interface SystemStatus {
  api: 'healthy' | 'warning' | 'error';
  database: 'up' | 'down';
  elasticsearch: 'up' | 'down';
  filesystem: 'up' | 'down';
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  timestamp: string;
}

export const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3004/health');
      const data = await response.json();
      
      setStatus({
        api: data.status === 'healthy' ? 'healthy' : 'warning',
        database: data.services?.database || 'up',
        elasticsearch: data.services?.elasticsearch || 'up',
        filesystem: data.services?.filesystem || 'up',
        uptime: data.uptime || 0,
        memory: data.memory || { heapUsed: 0, heapTotal: 0, rss: 0 },
        timestamp: data.timestamp || new Date().toISOString()
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setStatus({
        api: 'error',
        database: 'down',
        elasticsearch: 'down',
        filesystem: 'down',
        uptime: 0,
        memory: { heapUsed: 0, heapTotal: 0, rss: 0 },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy':
      case 'up':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy':
      case 'up':
        return <CheckCircleOutlined />;
      case 'warning':
        return <ExclamationCircleOutlined />;
      case 'error':
      case 'down':
        return <CloseCircleOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}시간 ${minutes}분 ${secs}초`;
  };

  if (loading && !status) {
    return (
      <Card title="시스템 상태" loading={true}>
        <p>시스템 상태를 확인하는 중...</p>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <span>🖥️ 시스템 상태</span>
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={fetchSystemStatus}
            loading={loading}
            size="small"
          >
            새로고침
          </Button>
        </Space>
      }
      extra={
        <span style={{ fontSize: '12px', color: '#666' }}>
          마지막 업데이트: {lastUpdated.toLocaleTimeString()}
        </span>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={
                <Space>
                  <CloudServerOutlined />
                  API 서버
                </Space>
              }
              value={status?.api || 'unknown'}
              valueRender={() => (
                <Badge 
                  status={getStatusColor(status?.api || 'unknown')} 
                  text={
                    <Space>
                      {getStatusIcon(status?.api || 'unknown')}
                      {status?.api === 'healthy' ? '정상' : 
                       status?.api === 'warning' ? '주의' : 
                       status?.api === 'error' ? '오류' : '알 수 없음'}
                    </Space>
                  }
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={
                <Space>
                  <DatabaseOutlined />
                  데이터베이스
                </Space>
              }
              value={status?.database || 'unknown'}
              valueRender={() => (
                <Badge 
                  status={getStatusColor(status?.database || 'unknown')} 
                  text={
                    <Space>
                      {getStatusIcon(status?.database || 'unknown')}
                      {status?.database === 'up' ? '연결됨' : 
                       status?.database === 'down' ? '연결 끊김' : '알 수 없음'}
                    </Space>
                  }
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={
                <Space>
                  <FileSearchOutlined />
                  검색 엔진
                </Space>
              }
              value={status?.elasticsearch || 'unknown'}
              valueRender={() => (
                <Badge 
                  status={getStatusColor(status?.elasticsearch || 'unknown')} 
                  text={
                    <Space>
                      {getStatusIcon(status?.elasticsearch || 'unknown')}
                      {status?.elasticsearch === 'up' ? '동작 중' : 
                       status?.elasticsearch === 'down' ? '중지됨' : '알 수 없음'}
                    </Space>
                  }
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="업타임"
              value={status?.uptime ? formatUptime(status.uptime) : '알 수 없음'}
              prefix="⏱️"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="메모리 사용량"
              value={status?.memory ? formatBytes(status.memory.heapUsed) : '0 MB'}
              suffix={status?.memory ? `/ ${formatBytes(status.memory.heapTotal)}` : ''}
              prefix="🧠"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="총 메모리"
              value={status?.memory ? formatBytes(status.memory.rss) : '0 MB'}
              prefix="💾"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="마지막 확인"
              value={status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : '알 수 없음'}
              prefix="📅"
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};