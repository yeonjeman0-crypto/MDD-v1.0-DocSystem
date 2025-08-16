import { useState } from 'react';
import { Layout, Menu, Button, theme, Drawer, Space, Avatar } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  FileTextOutlined, 
  AppstoreOutlined,
  TeamOutlined,
  SearchOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { DashboardPage } from './pages/DashboardPage';
import { PackagesPage } from './pages/PackagesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SearchPage } from './pages/SearchPage';
import { MonitoringPage } from './pages/MonitoringPage';
import FleetPage from './pages/FleetPage';
import { SystemConcept } from './components/SystemConcept';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('concept');
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'concept',
      icon: <DashboardOutlined />,
      label: t('nav.concept'),
    },
    {
      key: 'packages',
      icon: <AppstoreOutlined />,
      label: t('nav.packages'),
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: t('nav.documents'),
    },
    {
      key: 'fleet',
      icon: <TeamOutlined />,
      label: t('nav.fleet'),
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: t('nav.search'),
    },
    {
      key: 'monitoring',
      icon: <DashboardOutlined />,
      label: t('nav.monitoring'),
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'concept':
        return <SystemConcept />;
      case 'packages':
        return <PackagesPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'fleet':
        return <FleetPage />;
      case 'search':
        return <SearchPage />;
      case 'monitoring':
        return <MonitoringPage />;
      default:
        return <SystemConcept />;
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
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
            {collapsed ? (
              <Avatar src="/doriko-logo.png" size="small" />
            ) : (
              <>
                <Avatar src="/doriko-logo.png" size="small" style={{ marginRight: '8px' }} />
                <span style={{ color: 'white', fontWeight: 'bold' }}>MDD Portal</span>
              </>
            )}
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
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src="/doriko-logo.png" size="small" style={{ marginRight: '8px' }} />
            <span>MDD Admin Portal</span>
          </div>
        }
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
              {selectedKey === 'concept' ? `🚀 ${t('nav.concept')}` :
               selectedKey === 'packages' ? `📦 ${t('nav.packages')}` :
               selectedKey === 'documents' ? `📄 ${t('nav.documents')}` :
               selectedKey === 'fleet' ? `🚢 ${t('nav.fleet')}` : 
               selectedKey === 'search' ? `🔍 ${t('nav.search')}` : `📊 ${t('nav.monitoring')}`}
            </h2>
          </div>
          <Space>
            <LanguageSwitcher />
          </Space>
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