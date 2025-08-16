import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Progress,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Statistic,
  Divider
} from 'antd';
import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DatabaseOutlined,
  FolderOutlined,
  FileZipOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'database' | 'documents';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: number;
  createdAt: string;
  duration: number;
  description?: string;
  location: string;
}

interface RestorePoint {
  id: string;
  backupId: string;
  name: string;
  timestamp: string;
  version: string;
  components: string[];
  size: number;
  verified: boolean;
}

export const BackupSystem: React.FC = () => {
  const { t } = useTranslation();
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [currentBackupProgress, setCurrentBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [form] = Form.useForm();

  // 초기 데모 데이터
  useEffect(() => {
    const demoBackups: BackupRecord[] = [
      {
        id: '1',
        name: 'Full System Backup - 2024-08-16',
        type: 'full',
        status: 'completed',
        size: 2.4 * 1024 * 1024 * 1024, // 2.4GB
        createdAt: '2024-08-16T10:30:00Z',
        duration: 1800, // 30 minutes
        description: 'Complete system backup including database, documents, and configurations',
        location: '/backups/full/2024-08-16_103000.backup'
      },
      {
        id: '2',
        name: 'Database Backup - Daily',
        type: 'database',
        status: 'completed',
        size: 512 * 1024 * 1024, // 512MB
        createdAt: '2024-08-16T02:00:00Z',
        duration: 300, // 5 minutes
        description: 'Automated daily database backup',
        location: '/backups/db/2024-08-16_020000.sql'
      },
      {
        id: '3',
        name: 'Document Archive - Weekly',
        type: 'documents',
        status: 'completed',
        size: 1.8 * 1024 * 1024 * 1024, // 1.8GB
        createdAt: '2024-08-15T18:00:00Z',
        duration: 900, // 15 minutes
        description: 'Weekly document archive backup',
        location: '/backups/docs/2024-08-15_180000.tar.gz'
      },
      {
        id: '4',
        name: 'Incremental Backup',
        type: 'incremental',
        status: 'running',
        size: 0,
        createdAt: '2024-08-16T15:00:00Z',
        duration: 0,
        description: 'Incremental backup in progress',
        location: '/backups/incremental/2024-08-16_150000.inc'
      }
    ];

    const demoRestorePoints: RestorePoint[] = [
      {
        id: '1',
        backupId: '1',
        name: 'System Restore Point - v1.2.3',
        timestamp: '2024-08-16T10:30:00Z',
        version: 'v1.2.3',
        components: ['Database', 'Documents', 'Configuration', 'User Data'],
        size: 2.4 * 1024 * 1024 * 1024,
        verified: true
      },
      {
        id: '2',
        backupId: '2',
        name: 'Database Restore Point',
        timestamp: '2024-08-16T02:00:00Z',
        version: 'v1.2.2',
        components: ['Database'],
        size: 512 * 1024 * 1024,
        verified: true
      }
    ];

    setBackups(demoBackups);
    setRestorePoints(demoRestorePoints);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'failed': return 'red';
      case 'scheduled': return 'orange';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <DatabaseOutlined />;
      case 'incremental': return <SyncOutlined />;
      case 'database': return <DatabaseOutlined />;
      case 'documents': return <FolderOutlined />;
      default: return <FileZipOutlined />;
    }
  };

  const handleCreateBackup = async (values: any) => {
    try {
      setIsBackingUp(true);
      setCurrentBackupProgress(0);
      
      // 시뮬레이션된 백업 프로세스
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setCurrentBackupProgress(i);
      }
      
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        name: values.name || `${values.type} Backup - ${dayjs().format('YYYY-MM-DD HH:mm')}`,
        type: values.type,
        status: 'completed',
        size: Math.random() * 1024 * 1024 * 1024, // Random size
        createdAt: new Date().toISOString(),
        duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
        description: values.description,
        location: `/backups/${values.type}/${dayjs().format('YYYY-MM-DD_HHmmss')}.backup`
      };
      
      setBackups(prev => [newBackup, ...prev]);
      message.success('백업이 성공적으로 완료되었습니다');
      setBackupModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('백업 생성 중 오류가 발생했습니다');
    } finally {
      setIsBackingUp(false);
      setCurrentBackupProgress(0);
    }
  };

  const handleRestore = async (restorePoint: RestorePoint) => {
    Modal.confirm({
      title: '시스템 복원 확인',
      content: `"${restorePoint.name}"으로 시스템을 복원하시겠습니까? 현재 데이터가 손실될 수 있습니다.`,
      okText: '복원',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          // 시뮬레이션된 복원 프로세스
          await new Promise(resolve => setTimeout(resolve, 3000));
          message.success('시스템 복원이 완료되었습니다');
        } catch (error) {
          message.error('복원 중 오류가 발생했습니다');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const backupColumns = [
    {
      title: '백업명',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: BackupRecord) => (
        <Space>
          {getTypeIcon(record.type)}
          <div>
            <div><Text strong>{text}</Text></div>
            <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          full: '전체 백업',
          incremental: '증분 백업',
          database: '데이터베이스',
          documents: '문서'
        };
        return <Tag>{typeMap[type as keyof typeof typeMap]}</Tag>;
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          completed: '완료',
          running: '진행중',
          failed: '실패',
          scheduled: '예약됨'
        };
        return <Tag color={getStatusColor(status)}>{statusMap[status as keyof typeof statusMap]}</Tag>;
      },
    },
    {
      title: '크기',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '생성일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '소요시간',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration > 0 ? formatDuration(duration) : '-',
    },
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: BackupRecord) => (
        <Space>
          <Button 
            size="small" 
            icon={<CloudDownloadOutlined />}
            disabled={record.status !== 'completed'}
          >
            다운로드
          </Button>
          <Button 
            size="small" 
            icon={<HistoryOutlined />}
            disabled={record.status !== 'completed'}
            onClick={() => {
              const restorePoint = restorePoints.find(rp => rp.backupId === record.id);
              if (restorePoint) handleRestore(restorePoint);
            }}
          >
            복원
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    totalSize: backups.reduce((sum, b) => sum + b.size, 0),
    lastBackup: backups.length > 0 ? backups[0].createdAt : null
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="총 백업 수"
              value={stats.total}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="완료된 백업"
              value={stats.completed}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="총 백업 크기"
              value={formatFileSize(stats.totalSize)}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="마지막 백업"
              value={stats.lastBackup ? dayjs(stats.lastBackup).fromNow() : 'None'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Backup Progress */}
      {isBackingUp && (
        <Alert
          message="백업 진행 중"
          description={
            <div>
              <Progress percent={currentBackupProgress} status="active" />
              <Text>시스템 백업을 생성하고 있습니다... {currentBackupProgress}%</Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Main Backup Table */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              🗄️ 백업 관리
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => setBackupModalVisible(true)}
                disabled={isBackingUp}
              >
                새 백업 생성
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setRestoreModalVisible(true)}
              >
                복원 지점 관리
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={backupColumns}
          dataSource={backups}
          rowKey="id"
          loading={loading}
          pagination={{
            total: backups.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `총 ${total}개 백업`,
          }}
        />
      </Card>

      {/* Create Backup Modal */}
      <Modal
        title="새 백업 생성"
        open={backupModalVisible}
        onCancel={() => setBackupModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBackup}
        >
          <Form.Item
            label="백업 타입"
            name="type"
            rules={[{ required: true, message: '백업 타입을 선택하세요' }]}
          >
            <Select placeholder="백업 타입 선택">
              <Option value="full">전체 백업</Option>
              <Option value="incremental">증분 백업</Option>
              <Option value="database">데이터베이스만</Option>
              <Option value="documents">문서만</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="백업명"
            name="name"
          >
            <Input placeholder="백업명 (자동 생성됨)" />
          </Form.Item>

          <Form.Item
            label="설명"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="백업에 대한 설명을 입력하세요" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBackupModalVisible(false)}>
                취소
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isBackingUp}
                icon={<CloudUploadOutlined />}
              >
                백업 시작
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Restore Points Modal */}
      <Modal
        title="복원 지점 관리"
        open={restoreModalVisible}
        onCancel={() => setRestoreModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setRestoreModalVisible(false)}>
            닫기
          </Button>
        ]}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {restorePoints.map(point => (
            <Card key={point.id} size="small">
              <Row gutter={16} align="middle">
                <Col span={16}>
                  <Space direction="vertical" size="small">
                    <Text strong>{point.name}</Text>
                    <Text type="secondary">버전: {point.version}</Text>
                    <Text type="secondary">구성요소: {point.components.join(', ')}</Text>
                    <Text type="secondary">크기: {formatFileSize(point.size)}</Text>
                  </Space>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Space direction="vertical" size="small">
                    <Text>{dayjs(point.timestamp).format('YYYY-MM-DD HH:mm')}</Text>
                    {point.verified ? (
                      <Tag color="green">검증됨</Tag>
                    ) : (
                      <Tag color="orange">미검증</Tag>
                    )}
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleRestore(point)}
                      icon={<HistoryOutlined />}
                    >
                      복원
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </Modal>
    </div>
  );
};