import React, { useState } from 'react';
import { Card, Button, Space, message, Statistic, Row, Col, Alert } from 'antd';
import { 
  RocketOutlined, 
  DatabaseOutlined, 
  FileSearchOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const API_BASE_URL = 'http://localhost:3004';

export const QuickActions: React.FC = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setButtonLoading = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickPackageCreate = async () => {
    setButtonLoading('package', true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages/create-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            description: `퀵 패키지 생성 - ${new Date().toLocaleString('ko-KR')}`,
            vessel: 'DORIKO Fleet',
            creator: 'Admin Portal'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const sizeMB = (result.package.size / 1024 / 1024).toFixed(1);
        message.success({
          content: `📦 DRK 패키지 생성 완료! 크기: ${sizeMB} MB`,
          duration: 4
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Package creation failed:', error);
      message.error('패키지 생성에 실패했습니다. 서버 상태를 확인해주세요.');
    } finally {
      setButtonLoading('package', false);
    }
  };

  const handleHealthCheck = async () => {
    setButtonLoading('health', true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const health = await response.json();
        message.success({
          content: `✅ 시스템 정상 (가동시간: ${Math.round(health.uptime)}초)`,
          duration: 3
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      message.error('🔴 서버 연결 실패');
    } finally {
      setButtonLoading('health', false);
    }
  };

  const handleQuickValidation = async () => {
    setButtonLoading('validate', true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/lists/validate`);
      if (response.ok) {
        message.success({
          content: '📋 문서 구조 검증 완료',
          duration: 3
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      message.error('문서 검증에 실패했습니다.');
    } finally {
      setButtonLoading('validate', false);
    }
  };

  const handleDataImport = async () => {
    setButtonLoading('import', true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/data/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        message.success({
          content: `📊 데이터 임포트 완료 (${result.mainManual + result.procedures + result.instructions + result.forms}개 항목)`,
          duration: 4
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      message.error('데이터 임포트에 실패했습니다.');
    } finally {
      setButtonLoading('import', false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="🚀 빠른 작업" 
            style={{ height: '100%' }}
            extra={<RocketOutlined style={{ color: '#1890ff' }} />}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button 
                type="primary" 
                size="large" 
                block
                icon={loading.package ? <LoadingOutlined /> : <RocketOutlined />}
                loading={loading.package}
                onClick={handleQuickPackageCreate}
              >
                📦 원클릭 DRK 패키지 생성
              </Button>
              
              <Row gutter={8}>
                <Col span={12}>
                  <Button 
                    block
                    icon={loading.health ? <LoadingOutlined /> : <CheckCircleOutlined />}
                    loading={loading.health}
                    onClick={handleHealthCheck}
                  >
                    시스템 상태 확인
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    block
                    icon={loading.validate ? <LoadingOutlined /> : <FileSearchOutlined />}
                    loading={loading.validate}
                    onClick={handleQuickValidation}
                  >
                    문서 검증
                  </Button>
                </Col>
              </Row>

              <Button 
                block
                icon={loading.import ? <LoadingOutlined /> : <DatabaseOutlined />}
                loading={loading.import}
                onClick={handleDataImport}
              >
                📊 데이터베이스 동기화
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📊 시스템 개요" style={{ height: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="서비스 상태"
                  value="정상"
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  prefix="🟢"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="활성 포트"
                  value="3004"
                  valueStyle={{ fontSize: '18px' }}
                  prefix="🌐"
                />
              </Col>
            </Row>

            <div style={{ marginTop: '16px' }}>
              <Alert
                message="시스템 준비 완료"
                description="모든 서비스가 정상적으로 실행 중입니다. DRK 패키지 생성, 문서 관리, 선박 관리 기능을 사용할 수 있습니다."
                type="success"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p>🔧 API 서버: http://localhost:3004</p>
                <p>🎨 Admin Portal: http://localhost:5177</p>
                <p>📱 Electron Viewer: http://localhost:5176</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="💡 사용 팁">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <RocketOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                  <h4>원클릭 패키지 생성</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    모든 PDF 문서를 포함한 DRK 패키지를 한 번의 클릭으로 생성합니다.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <FileSearchOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                  <h4>실시간 문서 검색</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    문서 검색 메뉴에서 절차서, 지침서, 서식을 빠르게 찾을 수 있습니다.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <DatabaseOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
                  <h4>선박 정보 관리</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    선박 관리 메뉴에서 DORIKO 선대의 상태와 인증서를 확인합니다.
                  </p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};