import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  notification,
  Tabs,
  Progress,
  Badge,
  Tooltip,
  Typography,
  Alert,
} from 'antd';
import {
  ShipIcon,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  ToolOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { fleetApi } from '../services/fleetApi';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Vessel {
  id: number;
  imoNumber: string;
  vesselName: string;
  callSign: string;
  mmsiNumber: string;
  vesselType: string;
  status: string;
  flagState: string;
  portOfRegistry: string;
  grossTonnage: number;
  deadweight: number;
  lengthOverall: number;
  buildDate: string;
  owner: string;
  operator: string;
  classificationSociety: string;
  currentPort?: string;
  destination?: string;
  ageInYears: number;
  isCertificateExpiringSoon: boolean;
}

interface Certificate {
  id: number;
  certificateType: string;
  certificateName: string;
  certificateNumber: string;
  status: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  priorityLevel: string;
  isCritical: boolean;
}

interface FleetStatistics {
  totalVessels: number;
  vesselsByType: { type: string; count: number }[];
  vesselsByStatus: { status: string; count: number }[];
  averageAge: number;
  totalDeadweight: number;
  totalGrossTonnage: number;
  certificatesExpiring: number;
  certificatesExpired: number;
  certificatesValid: number;
  criticalAlerts: number;
  maintenanceDue: number;
}

interface CertificateAlert {
  vesselId: number;
  vesselName: string;
  imoNumber: string;
  certificateId: number;
  certificateType: string;
  certificateName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  priorityLevel: string;
  isCritical: boolean;
}

const FleetPage: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [statistics, setStatistics] = useState<FleetStatistics | null>(null);
  const [alerts, setAlerts] = useState<CertificateAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isVesselModalVisible, setIsVesselModalVisible] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    setLoading(true);
    try {
      const [
        vesselResponse,
        statisticsResponse,
        alertsResponse,
      ] = await Promise.all([
        fleetApi.getAllVessels(),
        fleetApi.getFleetStatistics(),
        fleetApi.getCertificateAlerts(),
      ]);

      setVessels(vesselResponse.data);
      setStatistics(statisticsResponse.data);
      setAlerts(alertsResponse.data);
    } catch (error) {
      notification.error({
        message: 'Failed to load fleet data',
        description: 'An error occurred while loading fleet information.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'green',
      MAINTENANCE: 'orange',
      DOCKED: 'blue',
      DECOMMISSIONED: 'red',
      EMERGENCY: 'red',
    };
    return colors[status] || 'default';
  };

  const getVesselTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      CONTAINER: 'blue',
      BULK_CARRIER: 'green',
      TANKER: 'orange',
      CRUISE: 'purple',
      FERRY: 'cyan',
      CARGO: 'geekblue',
      FISHING: 'lime',
      NAVAL: 'red',
      OFFSHORE: 'magenta',
      OTHER: 'default',
    };
    return colors[type] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      HIGH: 'red',
      MEDIUM: 'orange',
      LOW: 'green',
    };
    return colors[priority] || 'default';
  };

  const vesselColumns = [
    {
      title: 'Vessel Name',
      dataIndex: 'vesselName',
      key: 'vesselName',
      sorter: (a: Vessel, b: Vessel) => a.vesselName.localeCompare(b.vesselName),
      render: (text: string, record: Vessel) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            IMO: {record.imoNumber}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'vesselType',
      key: 'vesselType',
      render: (type: string) => (
        <Tag color={getVesselTypeColor(type)}>
          {type.replace('_', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'Container', value: 'CONTAINER' },
        { text: 'Bulk Carrier', value: 'BULK_CARRIER' },
        { text: 'Tanker', value: 'TANKER' },
        { text: 'Cruise', value: 'CRUISE' },
        { text: 'Ferry', value: 'FERRY' },
        { text: 'Cargo', value: 'CARGO' },
        { text: 'Other', value: 'OTHER' },
      ],
      onFilter: (value: string, record: Vessel) => record.vesselType === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Vessel) => (
        <Space>
          <Tag color={getStatusColor(status)}>
            {status}
          </Tag>
          {record.isCertificateExpiringSoon && (
            <Tooltip title="Certificates expiring soon">
              <AlertOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      ),
      filters: [
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Maintenance', value: 'MAINTENANCE' },
        { text: 'Docked', value: 'DOCKED' },
        { text: 'Decommissioned', value: 'DECOMMISSIONED' },
        { text: 'Emergency', value: 'EMERGENCY' },
      ],
      onFilter: (value: string, record: Vessel) => record.status === value,
    },
    {
      title: 'Flag State',
      dataIndex: 'flagState',
      key: 'flagState',
      sorter: (a: Vessel, b: Vessel) => a.flagState.localeCompare(b.flagState),
    },
    {
      title: 'DWT',
      dataIndex: 'deadweight',
      key: 'deadweight',
      sorter: (a: Vessel, b: Vessel) => a.deadweight - b.deadweight,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Age',
      dataIndex: 'ageInYears',
      key: 'ageInYears',
      sorter: (a: Vessel, b: Vessel) => a.ageInYears - b.ageInYears,
      render: (age: number) => `${age} years`,
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: Vessel) => (
        <Space direction="vertical" size={0}>
          {record.currentPort && (
            <Text style={{ fontSize: '12px' }}>
              <GlobalOutlined /> {record.currentPort}
            </Text>
          )}
          {record.destination && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              → {record.destination}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Vessel) => (
        <Space>
          <Button size="small" onClick={() => viewVesselDetails(record)}>
            View
          </Button>
          <Button size="small" onClick={() => editVessel(record)}>
            Edit
          </Button>
          <Button size="small" onClick={() => manageCertificates(record)}>
            Certificates
          </Button>
        </Space>
      ),
    },
  ];

  const alertColumns = [
    {
      title: 'Vessel',
      key: 'vessel',
      render: (record: CertificateAlert) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.vesselName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            IMO: {record.imoNumber}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Certificate',
      key: 'certificate',
      render: (record: CertificateAlert) => (
        <Space direction="vertical" size={0}>
          <Text>{record.certificateName}</Text>
          <Tag color={getVesselTypeColor(record.certificateType)}>
            {record.certificateType}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a: CertificateAlert, b: CertificateAlert) => 
        dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
    },
    {
      title: 'Days Until Expiry',
      dataIndex: 'daysUntilExpiry',
      key: 'daysUntilExpiry',
      render: (days: number) => (
        <Tag color={days <= 30 ? 'red' : days <= 90 ? 'orange' : 'green'}>
          {days} days
        </Tag>
      ),
      sorter: (a: CertificateAlert, b: CertificateAlert) => a.daysUntilExpiry - b.daysUntilExpiry,
    },
    {
      title: 'Priority',
      dataIndex: 'priorityLevel',
      key: 'priorityLevel',
      render: (priority: string, record: CertificateAlert) => (
        <Space>
          <Tag color={getPriorityColor(priority)}>
            {priority}
          </Tag>
          {record.isCritical && (
            <Badge status="error" text="Critical" />
          )}
        </Space>
      ),
    },
  ];

  const viewVesselDetails = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setIsVesselModalVisible(true);
  };

  const editVessel = (vessel: Vessel) => {
    // TODO: Implement vessel editing
    notification.info({
      message: 'Feature Coming Soon',
      description: 'Vessel editing feature will be available in the next update.',
    });
  };

  const manageCertificates = (vessel: Vessel) => {
    // TODO: Implement certificate management
    notification.info({
      message: 'Feature Coming Soon',
      description: 'Certificate management feature will be available in the next update.',
    });
  };

  const addNewVessel = () => {
    // TODO: Implement vessel creation
    notification.info({
      message: 'Feature Coming Soon',
      description: 'Vessel creation feature will be available in the next update.',
    });
  };

  const filteredVessels = vessels.filter(vessel => {
    const matchesSearch = vessel.vesselName.toLowerCase().includes(searchText.toLowerCase()) ||
                         vessel.imoNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                         vessel.callSign.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || vessel.vesselType === filterType;
    const matchesStatus = filterStatus === 'all' || vessel.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderOverviewTab = () => (
    <div>
      {/* Fleet Statistics */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Vessels"
                value={statistics.totalVessels}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total DWT"
                value={statistics.totalDeadweight}
                suffix="MT"
                precision={0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average Age"
                value={statistics.averageAge}
                suffix="years"
                precision={1}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Critical Alerts"
                value={statistics.criticalAlerts}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Certificate Status */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Certificate Status" extra={<SafetyCertificateOutlined />}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Valid"
                    value={statistics.certificatesValid}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Expiring"
                    value={statistics.certificatesExpiring}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Expired"
                    value={statistics.certificatesExpired}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
              </Row>
              <Progress
                percent={Math.round((statistics.certificatesValid / 
                  (statistics.certificatesValid + statistics.certificatesExpiring + statistics.certificatesExpired)) * 100)}
                status="active"
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Fleet Composition" extra={<BarChartOutlined />}>
              {statistics.vesselsByType.map(item => (
                <div key={item.type} style={{ marginBottom: 8 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Tag color={getVesselTypeColor(item.type)}>
                        {item.type.replace('_', ' ')}
                      </Tag>
                    </Col>
                    <Col>
                      <Text strong>{item.count}</Text>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card title="Critical Alerts" style={{ marginBottom: 24 }}>
          <Alert
            message="Certificate Expiry Alerts"
            description={`${alerts.length} certificates require immediate attention`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={alerts.slice(0, 5)}
            columns={alertColumns}
            pagination={false}
            size="small"
            rowKey="certificateId"
          />
          {alerts.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button type="link" onClick={() => setActiveTab('alerts')}>
                View All Alerts ({alerts.length})
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  const renderVesselsTab = () => (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search vessels..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Type"
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              <Option value="CONTAINER">Container</Option>
              <Option value="BULK_CARRIER">Bulk Carrier</Option>
              <Option value="TANKER">Tanker</Option>
              <Option value="CRUISE">Cruise</Option>
              <Option value="FERRY">Ferry</Option>
              <Option value="CARGO">Cargo</Option>
              <Option value="OTHER">Other</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="DOCKED">Docked</Option>
              <Option value="DECOMMISSIONED">Decommissioned</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<FilterOutlined />}>
                Advanced Filter
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={addNewVessel}>
                Add Vessel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={filteredVessels}
          columns={vesselColumns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vessels`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );

  const renderAlertsTab = () => (
    <div>
      <Card>
        <Table
          dataSource={alerts}
          columns={alertColumns}
          loading={loading}
          rowKey="certificateId"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} alerts`,
          }}
        />
      </Card>
    </div>
  );

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <TeamOutlined /> Fleet Management
          </Title>
          <Text type="secondary">
            Comprehensive maritime fleet and certificate management system
          </Text>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={<span><BarChartOutlined />Overview</span>} key="overview">
            {renderOverviewTab()}
          </TabPane>
          <TabPane tab={<span><TeamOutlined />Vessels</span>} key="vessels">
            {renderVesselsTab()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                <AlertOutlined />
                Alerts
                {alerts.length > 0 && (
                  <Badge count={alerts.length} style={{ marginLeft: 8 }} />
                )}
              </span>
            } 
            key="alerts"
          >
            {renderAlertsTab()}
          </TabPane>
        </Tabs>

        {/* Vessel Details Modal */}
        <Modal
          title={selectedVessel ? `${selectedVessel.vesselName} Details` : 'Vessel Details'}
          visible={isVesselModalVisible}
          onCancel={() => setIsVesselModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedVessel && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="Basic Information">
                    <p><strong>IMO Number:</strong> {selectedVessel.imoNumber}</p>
                    <p><strong>Call Sign:</strong> {selectedVessel.callSign}</p>
                    <p><strong>MMSI:</strong> {selectedVessel.mmsiNumber}</p>
                    <p><strong>Type:</strong> 
                      <Tag color={getVesselTypeColor(selectedVessel.vesselType)} style={{ marginLeft: 8 }}>
                        {selectedVessel.vesselType.replace('_', ' ')}
                      </Tag>
                    </p>
                    <p><strong>Status:</strong> 
                      <Tag color={getStatusColor(selectedVessel.status)} style={{ marginLeft: 8 }}>
                        {selectedVessel.status}
                      </Tag>
                    </p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Registration">
                    <p><strong>Flag State:</strong> {selectedVessel.flagState}</p>
                    <p><strong>Port of Registry:</strong> {selectedVessel.portOfRegistry}</p>
                    <p><strong>Owner:</strong> {selectedVessel.owner}</p>
                    <p><strong>Operator:</strong> {selectedVessel.operator}</p>
                    <p><strong>Classification:</strong> {selectedVessel.classificationSociety}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Specifications">
                    <p><strong>Gross Tonnage:</strong> {selectedVessel.grossTonnage.toLocaleString()}</p>
                    <p><strong>Deadweight:</strong> {selectedVessel.deadweight.toLocaleString()} MT</p>
                    <p><strong>Length:</strong> {selectedVessel.lengthOverall} m</p>
                    <p><strong>Build Date:</strong> {dayjs(selectedVessel.buildDate).format('YYYY-MM-DD')}</p>
                    <p><strong>Age:</strong> {selectedVessel.ageInYears} years</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Current Status">
                    <p><strong>Current Port:</strong> {selectedVessel.currentPort || 'At Sea'}</p>
                    <p><strong>Destination:</strong> {selectedVessel.destination || 'N/A'}</p>
                    <p><strong>Certificate Status:</strong> 
                      {selectedVessel.isCertificateExpiringSoon ? (
                        <Tag color="red" style={{ marginLeft: 8 }}>Expiring Soon</Tag>
                      ) : (
                        <Tag color="green" style={{ marginLeft: 8 }}>Valid</Tag>
                      )}
                    </p>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default FleetPage;