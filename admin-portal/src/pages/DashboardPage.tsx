import React from 'react';
import { Layout, Typography, Row, Col } from 'antd';
import { QuickActions } from '../components/QuickActions';
import { SystemStatus } from '../components/SystemStatus';

const { Content } = Layout;
const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '24px', background: '#f5f5f7', minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            🚢 MDD 관리 대시보드
          </Title>
          <p style={{ color: '#666', marginTop: '8px' }}>
            해운업 문서 관리 시스템 - DORIKO Maritime Document Distribution
          </p>
        </div>
        
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <SystemStatus />
          </Col>
          <Col xs={24}>
            <QuickActions />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};