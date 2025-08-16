import React from 'react';
import { Card, Typography, Steps, Row, Col, Alert, Divider, Space, Tag, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  RocketOutlined, 
  BuildOutlined, 
  DatabaseOutlined,
  SyncOutlined,
  BookOutlined
} from '@ant-design/icons';
import { QuickStart } from './QuickStart';

const { Title, Paragraph, Text } = Typography;

export const SystemConcept: React.FC = () => {
  const { t } = useTranslation();
  
  const conceptSteps = [
    {
      title: t('concept.workflow.step1.title'),
      description: t('concept.workflow.step1.description'),
      icon: <DatabaseOutlined className="text-blue-500" />
    },
    {
      title: t('concept.workflow.step2.title'),
      description: t('concept.workflow.step2.description'),
      icon: <BuildOutlined className="text-green-500" />
    },
    {
      title: t('concept.workflow.step3.title'),
      description: t('concept.workflow.step3.description'),
      icon: <RocketOutlined className="text-purple-500" />
    },
    {
      title: t('concept.workflow.step4.title'),
      description: t('concept.workflow.step4.description'),
      icon: <SyncOutlined className="text-orange-500" />
    }
  ];

  const systemFeatures = [
    {
      title: t('concept.components.mdd.title'),
      features: t('concept.components.mdd.features', { returnObjects: true }) as string[]
    },
    {
      title: t('concept.components.admin.title'),
      features: t('concept.components.admin.features', { returnObjects: true }) as string[]
    },
    {
      title: t('concept.components.viewer.title'),
      features: t('concept.components.viewer.features', { returnObjects: true }) as string[]
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: t('concept.workflow.title'),
      icon: <DatabaseOutlined />,
      children: (
        <Row gutter={[16, 16]}>
        {/* 시스템 워크플로우 */}
        <Col span={24}>
          <Card title={`🔄 ${t('concept.workflow.title')}`} className="shadow-lg">
            <Steps
              items={conceptSteps.map((step, index) => ({
                title: step.title,
                description: step.description,
                icon: step.icon,
                status: 'finish'
              }))}
              direction="horizontal"
              size="small"
            />
          </Card>
        </Col>

        {/* 시스템 구성요소 */}
        <Col span={24}>
          <Title level={3}>🏗️ {t('concept.components.title')}</Title>
          <Row gutter={[16, 16]}>
            {systemFeatures.map((component, index) => (
              <Col xs={24} md={8} key={index}>
                <Card 
                  title={component.title}
                  className="h-full shadow-md hover:shadow-lg transition-shadow"
                  headStyle={{ background: '#f8f9fa', fontWeight: 'bold' }}
                >
                  <ul className="pl-4">
                    {component.features.map((feature, idx) => (
                      <li key={idx} className="mb-2">
                        <Text>{feature}</Text>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* DRK 패키지 개념 */}
        <Col span={24}>
          <Card title="📦 DRK 패키지 시스템" className="shadow-lg">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Title level={4}>🔵 전체 패키지 (.drkpack)</Title>
                <Paragraph>
                  <Tag color="blue">FULL</Tag>
                  모든 문서를 포함하는 완전한 패키지입니다.
                </Paragraph>
                <ul>
                  <li>초기 설치 시 사용</li>
                  <li>전체 시스템 복구 시 사용</li>
                  <li>크기: 200-300MB (압축)</li>
                </ul>
              </Col>
              <Col xs={24} md={12}>
                <Title level={4}>🟢 증분 패키지 (.drkdelta)</Title>
                <Paragraph>
                  <Tag color="green">DELTA</Tag>
                  변경된 파일만 포함하는 업데이트 패키지입니다.
                </Paragraph>
                <ul>
                  <li>일반적인 업데이트 시 사용</li>
                  <li>네트워크 대역폭 절약</li>
                  <li>크기: 1-50MB (변경사항에 따라)</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 사용 가이드 */}
        <Col span={24}>
          <Card title="📋 사용 가이드" className="shadow-lg">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" title="1️⃣ 문서 관리" className="h-full">
                  <Space direction="vertical" size="small">
                    <Text>• 문서 관리 메뉴에서 PDF 파일 업로드</Text>
                    <Text>• 카테고리별 분류 (매뉴얼, 절차서, 폼)</Text>
                    <Text>• 버전 관리 및 메타데이터 설정</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="2️⃣ 패키지 생성" className="h-full">
                  <Space direction="vertical" size="small">
                    <Text>• 패키지 관리에서 "패키지 생성" 클릭</Text>
                    <Text>• 소스 디렉토리 및 메타데이터 입력</Text>
                    <Text>• 전체/증분 패키지 타입 선택</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="3️⃣ 선박 배포" className="h-full">
                  <Space direction="vertical" size="small">
                    <Text>• 선박 관리에서 대상 선박 등록</Text>
                    <Text>• 생성된 패키지 다운로드</Text>
                    <Text>• 선박의 뷰어 앱에서 패키지 적용</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 기술 스펙 */}
        <Col span={24}>
          <Card title="⚙️ 기술 사양" className="shadow-lg">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Title level={5}>백엔드 기술스택</Title>
                <ul>
                  <li>NestJS + TypeScript</li>
                  <li>SQLite/PostgreSQL</li>
                  <li>Zstd 압축</li>
                  <li>Ed25519 전자서명</li>
                </ul>
              </Col>
              <Col xs={24} md={12}>
                <Title level={5}>프론트엔드 기술스택</Title>
                <ul>
                  <li>React 18 + TypeScript</li>
                  <li>Ant Design 5</li>
                  <li>Vite 빌드</li>
                  <li>Electron (Ship Viewer)</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      )
    },
    {
      key: 'quickstart',
      label: 'Quick Start',
      icon: <BookOutlined />,
      children: <QuickStart />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message={t('concept.title')}
        description={t('concept.description')}
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Tabs
        defaultActiveKey="overview"
        items={tabItems}
        size="large"
        tabPosition="top"
        className="shadow-lg bg-white rounded-lg"
      />
    </div>
  );
};