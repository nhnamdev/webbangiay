
import { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined, ShoppingOutlined, TagOutlined, ShoppingCartOutlined,
  UserOutlined, GiftOutlined, ReadOutlined, WalletOutlined, StarOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, HomeOutlined,
} from '@ant-design/icons';
import { logoutUser } from "../../services/api";
import { clearAdminSessionCookie } from '../../services/authStorage';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const navItems = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/products", label: "Sản phẩm", icon: <ShoppingOutlined /> },
  { key: "/admin/brands", label: "Thương hiệu", icon: <TagOutlined /> },
  { key: "/admin/orders", label: "Đơn hàng", icon: <ShoppingCartOutlined /> },
  { key: "/admin/users", label: "Người dùng", icon: <UserOutlined /> },
  { key: "/admin/coupons", label: "Mã giảm giá", icon: <GiftOutlined /> },
  { key: "/admin/news", label: "Tin tức", icon: <ReadOutlined /> },
  { key: "/admin/vouchers", label: "Voucher", icon: <WalletOutlined /> },
  { key: "/admin/points", label: "Điểm thưởng", icon: <StarOutlined /> },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleLogout = async () => {
    await logoutUser();
    clearAdminSessionCookie();
    navigate("/login");
  };

  const selectedKey = '/' + pathname.split('/').slice(1, 3).join('/');
  const currentItem = navItems.find(n => n.key === selectedKey);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ fontSize: 24 }}>👟</span>
          {!collapsed && <Text strong style={{ color: '#fff', fontSize: 16, whiteSpace: 'nowrap' }}>ZestFoot</Text>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />

        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px',
        }}>
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{ color: 'rgba(255,255,255,0.65)', width: '100%', textAlign: 'left', paddingLeft: collapsed ? 8 : 24 }}
          >
            {!collapsed && 'Về trang chủ'}
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 40, height: 40 }}
            />
            <Text strong style={{ fontSize: 16 }}>{currentItem?.label || 'Admin Panel'}</Text>
          </Space>

          <Space size="middle">
            <Button type="primary" ghost icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: 24, minHeight: 280 }}>
          <div style={{
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 360,
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
