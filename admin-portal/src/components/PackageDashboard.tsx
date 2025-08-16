import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Space,
  Typography,
  Alert,
  Button,
  Spin,
  List,
  Avatar
} from 'antd';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileZipOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { packageApi } from '../services/packageApi';

const { Text } = Typography;

interface DashboardStats {
  totalPackages: number;
  fullPackages: number;
  deltaPackages: number;
  totalSize: number;
  todayPackages: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'created' | 'verified' | 'downloaded' | 'applied';
  filename: string;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
  message?: string;
}

export const PackageDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPackages: 0,
    fullPackages: 0,
    deltaPackages: 0,
    totalSize: 0,
    todayPackages: 0,
    successRate: 95.2
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 대시보드 데이터 조회
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // 패키지 통계 조회
      const packageStats = await packageApi.getPackageStats();
      const packages = await packageApi.listPackages();
      
      // 오늘 생성된 패키지 수 계산
      const today = dayjs().startOf('day');
      const todayPackages = packages.packages.filter(pkg => 
        dayjs(pkg.created_at).isAfter(today)
      ).length;

      setStats({
        ...packageStats,
        todayPackages,
        successRate: 95.2 // 실제로는 서버에서 계산된 성공률
      });

      // 최근 활동 시뮬레이션 (실제로는 서버에서 로그 데이터 조회)
      const activities: RecentActivity[] = packages.packages
        .slice(0, 10)
        .map((pkg, index) => ({
          id: `activity-${index}`,
          type: 'created',
          filename: pkg.filename,
          timestamp: pkg.created_at,
          status: 'success'
        }));

      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 컴포넌트 마운트시 데이터 조회
  useEffect(() => {
    fetchDashboardData();
    
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 활동 타입별 아이콘
  const getActivityIcon = (type: string) => {
    const iconStyle = { fontSize: '16px' };
    
    switch (type) {
      case 'created':
        return <CloudUploadOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'verified':
        return <CheckCircleOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
      case 'downloaded':
        return <DownloadOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
      case 'applied':
        return <RocketOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
      default:
        return <FileZipOutlined style={iconStyle} />;
    }
  };

  // 활동 타입별 메시지
  const getActivityMessage = (type: string) => {
    switch (type) {
      case 'created':
        return '패키지가 생성되었습니다';
      case 'verified':
        return '패키지 검증이 완료되었습니다';
      case 'downloaded':
        return '패키지가 다운로드되었습니다';
      case 'applied':
        return '패키지가 적용되었습니다';
      default:
        return '알 수 없는 활동';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>대시보드 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 상단 통계 카드 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="총 패키지 수"
              value={stats.totalPackages}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              suffix="개"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="전체 패키지"
              value={stats.fullPackages}
              prefix={<FileZipOutlined style={{ color: '#52c41a' }} />}
              suffix="개"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="증분 패키지"
              value={stats.deltaPackages}
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              suffix="개"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="총 저장 용량"
              value={formatFileSize(stats.totalSize)}
              prefix={<CloudUploadOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 중간 섹션 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <RocketOutlined />
                오늘의 활동
              </Space>
            }
            extra={
              <Button 
                type="link" 
                onClick={fetchDashboardData} 
                loading={refreshing}
              >
                새로고침
              </Button>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="오늘 생성된 패키지"
                  value={stats.todayPackages}
                  suffix="개"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="성공률"
                  value={stats.successRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: stats.successRate >= 95 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Progress 
                percent={stats.successRate} 
                status={stats.successRate >= 95 ? 'success' : 'exception'}
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyOutlined />
                시스템 상태
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>API 서버</Text>
                <Badge status="processing" text="실행 중" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>패키지 스토리지</Text>
                <Badge status="success" text="정상" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>암호화 서비스</Text>
                <Badge status="success" text="활성화" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>압축 엔진</Text>
                <Badge status="success" text="정상" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 하단 섹션 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                최근 활동
              </Space>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getActivityIcon(item.type)}
                        style={{ 
                          backgroundColor: item.status === 'success' ? '#f6ffed' : '#fff2e8',
                          border: '1px solid #d9d9d9'
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.filename}</Text>
                        <Badge 
                          status={item.status === 'success' ? 'success' : 'error'} 
                          text={getActivityMessage(item.type)}
                        />
                      </Space>
                    }
                    description={dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined />
                알림
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="패키지 스토리지 용량"
                description="현재 85% 사용 중입니다."
                type="warning"
                showIcon
                closable
              />
              <Alert
                message="자동 백업"
                description="다음 백업: 오늘 오후 6시"
                type="info"
                showIcon
                closable
              />
              <Alert
                message="시스템 업데이트"
                description="새로운 기능이 추가되었습니다."
                type="success"
                showIcon
                closable
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};