import React from 'react';
import { Card, Typography, Steps, Row, Col, Alert, Button, Space } from 'antd';
import { 
  PlayCircleOutlined, 
  UploadOutlined, 
  BuildOutlined, 
  DownloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export const QuickStart: React.FC = () => {
  const quickStartSteps = [
    {
      title: '1. 시스템 소개 확인',
      description: '메인 화면에서 MDD 시스템의 개념과 워크플로우를 이해하세요',
      icon: <PlayCircleOutlined className="text-blue-500" />,
      action: '시스템 소개 페이지 방문'
    },
    {
      title: '2. 문서 업로드',
      description: '문서 관리 메뉴에서 PDF 파일들을 업로드하고 분류하세요',
      icon: <UploadOutlined className="text-green-500" />,
      action: '문서 관리 → 파일 업로드'
    },
    {
      title: '3. DRK 패키지 생성',
      description: '패키지 관리에서 배포용 .drkpack 파일을 생성하세요',
      icon: <BuildOutlined className="text-orange-500" />,
      action: '패키지 관리 → 패키지 생성'
    },
    {
      title: '4. 패키지 다운로드',
      description: '생성된 패키지를 다운로드하여 선박에 배포하세요',
      icon: <DownloadOutlined className="text-purple-500" />,
      action: '패키지 목록 → 다운로드'
    },
    {
      title: '5. 선박 등록 관리',
      description: '선박 관리에서 대상 선박들을 등록하고 관리하세요',
      icon: <CheckCircleOutlined className="text-cyan-500" />,
      action: '선박 관리 → 선박 등록'
    }
  ];

  const commonTasks = [
    {
      title: '📦 새 패키지 생성하기',
      description: 'Step by Step',
      steps: [
        '1. 패키지 관리 메뉴 클릭',
        '2. "패키지 생성" 버튼 클릭',
        '3. 소스 디렉토리 입력 (선택사항)',
        '4. 설명 및 메타데이터 입력',
        '5. "패키지 생성" 실행',
        '6. 생성 완료 후 목록에서 확인'
      ]
    },
    {
      title: '🚢 선박 등록하기',
      description: 'Step by Step',
      steps: [
        '1. 선박 관리 메뉴 클릭',
        '2. "선박 추가" 버튼 클릭',
        '3. 선박 정보 입력 (IMO, MMSI, 선명)',
        '4. 회사 정보 및 연락처 입력',
        '5. 저장 후 목록에서 확인',
        '6. 필요시 패키지 할당'
      ]
    },
    {
      title: '📄 문서 관리하기',
      description: 'Step by Step',
      steps: [
        '1. 문서 관리 메뉴 클릭',
        '2. 카테고리 선택 (매뉴얼/절차서/폼)',
        '3. "파일 업로드" 버튼 클릭',
        '4. PDF 파일 선택 및 업로드',
        '5. 메타데이터 및 버전 정보 입력',
        '6. 저장 후 문서 목록 확인'
      ]
    }
  ];

  const troubleshootingTips = [
    {
      issue: '패키지 생성 실패',
      solution: '소스 디렉토리 경로 확인, 한글 경로는 기본값 사용 권장'
    },
    {
      issue: '파일 업로드 오류',
      solution: 'PDF 파일 형식 확인, 파일 크기 제한 (100MB) 확인'
    },
    {
      issue: '한글 경로 문제',
      solution: '경로에 한글이 포함된 경우 기본 디렉토리 사용 권장'
    },
    {
      issue: '네트워크 연결 오류',
      solution: 'API 서버 상태 확인 (localhost:3005), 방화벽 설정 확인'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="🚀 빠른 시작 가이드"
        description="MDD 시스템을 처음 사용하시는 분들을 위한 단계별 가이드입니다."
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Row gutter={[16, 16]}>
        {/* 빠른 시작 단계 */}
        <Col span={24}>
          <Card title="📋 5단계로 시작하기" className="shadow-lg">
            <Steps
              direction="vertical"
              current={-1}
              items={quickStartSteps.map((step, index) => ({
                title: step.title,
                description: (
                  <div>
                    <Paragraph style={{ margin: '8px 0' }}>{step.description}</Paragraph>
                    <Button type="link" size="small" icon={step.icon}>
                      {step.action}
                    </Button>
                  </div>
                ),
                status: 'wait'
              }))}
            />
          </Card>
        </Col>

        {/* 주요 작업 가이드 */}
        <Col span={24}>
          <Title level={3}>🛠️ 주요 작업 가이드</Title>
          <Row gutter={[16, 16]}>
            {commonTasks.map((task, index) => (
              <Col xs={24} lg={8} key={index}>
                <Card 
                  title={task.title}
                  extra={<Text type="secondary">{task.description}</Text>}
                  className="h-full shadow-md"
                >
                  <ol className="pl-4">
                    {task.steps.map((step, idx) => (
                      <li key={idx} className="mb-2">
                        <Text>{step}</Text>
                      </li>
                    ))}
                  </ol>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* 문제 해결 */}
        <Col span={24}>
          <Card title="🔧 문제 해결" className="shadow-lg">
            <Row gutter={[16, 16]}>
              {troubleshootingTips.map((tip, index) => (
                <Col xs={24} md={12} key={index}>
                  <Card size="small" className="bg-red-50 border-red-200">
                    <Space direction="vertical" size="small">
                      <Text strong className="text-red-600">❌ {tip.issue}</Text>
                      <Text className="text-green-600">✅ {tip.solution}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 시스템 상태 */}
        <Col span={24}>
          <Card title="🌐 시스템 정보" className="shadow-lg">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" title="API 서버">
                  <Text>http://localhost:3005</Text>
                  <br />
                  <Text type="secondary">NestJS Backend</Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Admin Portal">
                  <Text>http://localhost:5179</Text>
                  <br />
                  <Text type="secondary">React Frontend</Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="API 문서">
                  <Text>http://localhost:3005/api/docs</Text>
                  <br />
                  <Text type="secondary">Swagger UI</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};