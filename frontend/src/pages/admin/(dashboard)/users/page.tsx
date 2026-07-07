
import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Tag, Input, InputNumber, Descriptions, Card, Statistic, Row, Col, Space, message, Typography, List } from "antd";
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { get, patch as patchReq } from "@/services/http";

const { Title, Text } = Typography;

interface User {
  id: number; email: string; fullName: string | null; points: number;
  spinTickets: number; lastLuckySpin: string | null; updatedAt: string | null;
}

const PAGE_SIZE = 10;

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [pointsInput, setPointsInput] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await get("/users", { params: { search, page, size: PAGE_SIZE } });
      setUsers(resp.data || []);
      setTotal(resp.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadDetail = async (user: User) => {
    try {
      const [transactions, vouchers, orders] = await Promise.all([
        get(`/users/${user.id}/point-transactions`).catch(() => []),
        get(`/users/${user.id}/vouchers`).catch(() => []),
        get(`/orders/user/${user.id}`).catch(() => []),
      ]);
      setDetail({ ...user, transactions, vouchers, orders: orders.slice(0, 5) });
      setPointsInput(user.points);
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    }
  };

  const updatePoints = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await patchReq(`/users/${detail.id}`, { points: pointsInput });
      message.success("Đã cập nhật điểm!");
      setDetail((d: any) => ({ ...d, points: pointsInput }));
      fetchData();
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, render: (id: number) => <Text code>#{id}</Text> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => <Text type="secondary">{v}</Text> },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (v: string | null) => v || '—' },
    {
      title: 'Điểm', dataIndex: 'points', key: 'points', width: 80,
      render: (v: number) => <Text strong style={{ color: '#fbbf24' }}>⭐ {v ?? 0}</Text>,
    },
    {
      title: 'Vé quay', dataIndex: 'spinTickets', key: 'spinTickets', width: 80,
      render: (v: number) => <Text style={{ color: '#818cf8' }}>🎟️ {v ?? 0}</Text>,
    },
    {
      title: 'Quay thưởng cuối', dataIndex: 'lastLuckySpin', key: 'lastLuckySpin', width: 100,
      render: (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : <Text type="secondary">Chưa quay</Text>,
    },
    {
      title: 'Cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', width: 100,
      render: (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : '—',
    },
    {
      title: '', key: 'action', width: 80,
      render: (_: any, r: User) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => loadDetail(r)} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Người dùng</Title>
        <Text type="secondary">{total} người dùng đã đăng ký</Text>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{
          current: page, pageSize: PAGE_SIZE, total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `Tổng ${t} người dùng`,
        }}
        locale={{ emptyText: 'Không tìm thấy người dùng' }}
        title={() => (
          <Input
            placeholder="Tìm theo tên/email..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            allowClear
            style={{ maxWidth: 320 }}
          />
        )}
      />

      <Modal
        title={`👤 ${detail?.fullName || 'Người dùng'}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={640}
      >
        {detail && (
          <div>
            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Điểm" value={`⭐ ${detail.points || 0}`} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Vé quay" value={`🎟️ ${detail.spinTickets || 0}`} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Voucher" value={`🎁 ${detail.vouchers?.length || 0}`} />
                </Card>
              </Col>
            </Row>

            <Space style={{ marginBottom: 20 }} align="end">
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Cập nhật điểm thưởng</Text>
                <InputNumber min={0} value={pointsInput} onChange={(v) => setPointsInput(v ?? 0)} />
              </div>
              <Button type="primary" icon={<ReloadOutlined />} onClick={updatePoints} loading={saving}>
                Cập nhật
              </Button>
            </Space>

            {detail.transactions?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>⭐ Lịch sử điểm</Text>
                <List
                  size="small"
                  dataSource={detail.transactions.slice(0, 5)}
                  renderItem={(t: any) => (
                    <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">{t.reason}</Text>
                      <Text strong style={{ color: t.type === 'earn' ? '#52c41a' : '#ff4d4f' }}>
                        {t.type === 'earn' ? '+' : '-'}{t.amount}
                      </Text>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {detail.vouchers?.length > 0 && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>🎁 Voucher</Text>
                <List
                  size="small"
                  dataSource={detail.vouchers}
                  renderItem={(v: any) => (
                    <List.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text code style={{ color: '#818cf8' }}>{v.code}</Text>
                      <Text strong style={{ color: '#52c41a' }}>{(v.discountAmount || 0).toLocaleString()}₫</Text>
                      <Tag color={v.status === 'active' ? 'green' : 'default'}>{v.status}</Tag>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
