import { useState } from 'react';
import { Layout, Menu, Button, theme, Drawer } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  FileTextOutlined, 
  AppstoreOutlined,
  TeamOutlined,
  SearchOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { PackagesPage } from './pages/PackagesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SearchPage } from './pages/SearchPage';
import { MonitoringPage } from './pages/MonitoringPage';
import FleetPage from './pages/FleetPage';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('fleet');
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'fleet',
      icon: <TeamOutlined />,
      label: '선박 관리',
    },
    {
      key: 'monitoring',
      icon: <DashboardOutlined />,
      label: '모니터링',
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '문서 검색',
    },
    {
      key: 'packages',
      icon: <AppstoreOutlined />,
      label: '패키지 관리',
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: '문서 관리',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'fleet':
        return <FleetPage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'search':
        return <SearchPage />;
      case 'packages':
        return <PackagesPage />;
      case 'documents':
        return <DocumentsPage />;
      default:
        return <FleetPage />;
    }
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
        >
          <div className="sidebar-logo">
            {collapsed ? 'MDD' : '🚢 MDD Admin Portal'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
          />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title="🚢 MDD Admin Portal"
        placement="left"
        closable={false}
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        styles={{ 
          body: { padding: 0 },
          wrapper: { display: isMobile ? 'block' : 'none' }
        }}
        width={250}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            setSelectedKey(key);
            setMobileDrawerVisible(false);
          }}
        />
      </Drawer>

      <Layout>
        <Header 
          style={{ 
            padding: '0 16px', 
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => {
                if (isMobile) {
                  setMobileDrawerVisible(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <h2 style={{ margin: 0, marginLeft: 16, color: '#1890ff' }}>
              {selectedKey === 'fleet' ? '🚢 선박 관리' : 
               selectedKey === 'monitoring' ? '📊 모니터링' :
               selectedKey === 'search' ? '🔍 문서 검색' :
               selectedKey === 'packages' ? '📦 패키지 관리' : '📄 문서 관리'}
            </h2>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;