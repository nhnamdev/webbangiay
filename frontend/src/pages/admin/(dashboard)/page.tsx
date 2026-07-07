
import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Spin, Typography } from "antd";
import {
  ShoppingOutlined, TagOutlined, ShoppingCartOutlined, UserOutlined,
  GiftOutlined, ReadOutlined, DollarOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { get } from "@/services/http";

const { Title, Text } = Typography;

interface Stats {
  products: number; brands: number; orders: number; users: number;
  coupons: number; news: number; revenue: number; pending: number;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'gold', label: 'Chờ xử lý' },
  processing: { color: 'blue', label: 'Đang xử lý' },
  shipped: { color: 'purple', label: 'Đang giao' },
  delivered: { color: 'green', label: 'Đã giao' },
  cancelled: { color: 'red', label: 'Đã hủy' },
};

const parseCustomer = (raw: any) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return null; }
};

const normalizeOrder = (raw: any) => {
  const customerRaw = raw?.customerJson ?? raw?.customer ?? null;
  return {
    ...raw,
    customerJson: customerRaw,
    totalAmount: raw?.totalAmount ?? raw?.total_amount ?? 0,
    paymentMethod: raw?.paymentMethod ?? raw?.payment_method ?? null,
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [products, brands, orders, usersResp, coupons, news] = await Promise.all([
          get("/products"), get("/brands"), get("/orders"),
          get("/users", { params: { page: 1, size: 1 } }),
          get("/coupons"), get("/news"),
        ]);

        const normalizedOrders = (orders || []).map(normalizeOrder);

        const revenue = normalizedOrders
          .filter((o: any) => o.status === "delivered")
          .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
        const pending = normalizedOrders.filter((o: any) => o.status === "pending").length;

        setStats({
          products: products?.length || 0, brands: brands?.length || 0,
          orders: normalizedOrders?.length || 0, users: usersResp?.total || 0,
          coupons: coupons?.length || 0, news: news?.length || 0,
          revenue, pending,
        });

        const sorted = [...normalizedOrders].sort((a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setRecentOrders(sorted.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const formatCurrency = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const columns = [
    { title: '#ID', dataIndex: 'id', key: 'id', render: (id: number) => <Text code>#{id}</Text> },
    {
      title: 'Khách hàng', key: 'customer',
      render: (_: any, r: any) => {
        const c = parseCustomer(r.customerJson ?? r.customer);
        return c?.name || c?.fullName || r.email || '—';
      },
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount',
      render: (v: number) => <Text strong>{formatCurrency(Number(v) || 0)}</Text>,
    },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (v: string) => v || '—' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s: string) => {
        const cfg = statusConfig[s];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{s}</Tag>;
      },
    },
    {
      title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : '—',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  const statCards = [
    { icon: <ShoppingOutlined />, color: '#722ed1', value: stats?.products.toLocaleString(), label: 'Sản phẩm' },
    { icon: <TagOutlined />, color: '#1890ff', value: stats?.brands, label: 'Thương hiệu' },
    { icon: <ShoppingCartOutlined />, color: '#fa8c16', value: stats?.orders.toLocaleString(), label: 'Đơn hàng' },
    { icon: <UserOutlined />, color: '#52c41a', value: stats?.users.toLocaleString(), label: 'Người dùng' },
    { icon: <DollarOutlined />, color: '#eb2f96', value: formatCurrency(stats?.revenue || 0), label: 'Doanh thu' },
    { icon: <ClockCircleOutlined />, color: '#f5222d', value: stats?.pending, label: 'Đơn chờ xử lý' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Tổng quan hệ thống ZestFoot</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <Col xs={12} sm={8} lg={6} key={i}>
            <Card hoverable size="small">
              <Statistic
                title={s.label}
                value={s.value}
                prefix={<span style={{ color: s.color, fontSize: 20 }}>{s.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Đơn hàng gần đây" size="small">
        <Table
          dataSource={recentOrders}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'Chưa có đơn hàng nào' }}
        />
      </Card>
    </div>
  );
}
