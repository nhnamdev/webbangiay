
import { useEffect, useState, useCallback } from "react";
import { Table, Tag, Button, Select, Modal, Descriptions, Space, message, Spin, Typography, Input, Card, Divider } from "antd";
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { get, put as putReq } from "@/services/http";

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "Chờ xử lý",  color: "gold" },
  processing: { label: "Đang xử lý", color: "blue" },
  shipped:    { label: "Đang giao",   color: "purple" },
  delivered:  { label: "Đã giao",    color: "green" },
  cancelled:  { label: "Đã hủy",     color: "red" },
};

const PAGE_SIZE = 10;

const parseJSON = (raw: any) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return null; }
};

const normalizeOrder = (raw: any) => {
  const customerRaw = raw?.customerJson ?? raw?.customer ?? null;
  const itemsRaw = raw?.orderItems ?? raw?.items ?? [];

  return {
    ...raw,
    customerJson: customerRaw,
    orderItems: Array.isArray(itemsRaw) ? itemsRaw : (parseJSON(itemsRaw) || []),
    totalAmount: raw?.totalAmount ?? raw?.total_amount ?? 0,
    subTotal: raw?.subTotal ?? raw?.sub_total ?? 0,
    shippingFee: raw?.shippingFee ?? raw?.shipping_fee ?? 0,
    paymentMethod: raw?.paymentMethod ?? raw?.payment_method ?? null,
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
    discountAmount: raw?.discountAmount ?? raw?.discount ?? 0,
    voucherDiscount: raw?.voucherDiscount ?? raw?.voucher_discount ?? 0,
    pointDiscount: raw?.pointDiscount ?? raw?.point_discount ?? 0,
  };
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all: any[] = (await get("/orders")) || [];
      let list = all.map(normalizeOrder);
      if (filterStatus) list = list.filter(o => o.status === filterStatus);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTotal(list.length);
      setOrders(list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await putReq(`/orders/${id}/status`, { status });
      message.success("Đã cập nhật trạng thái!");
      if (detail?.id === id) setDetail((d: any) => ({ ...d, status }));
      fetchData();
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    }
  };

  const fmt = (n: any) => Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const filtered = orders.filter(o => !search || String(o.id).includes(search));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const columns = [
    { title: '#ID', dataIndex: 'id', key: 'id', width: 70, render: (id: number) => <Text code>#{id}</Text> },
    {
      title: 'Khách hàng', key: 'customer', width: 140,
      render: (_: any, r: any) => {
        const c = parseJSON(r.customerJson ?? r.customer);
        return c?.name || c?.fullName || r.email || '—';
      },
    },
    {
      title: 'SĐT', key: 'phone', width: 110,
      render: (_: any, r: any) => {
        const c = parseJSON(r.customerJson ?? r.customer);
        return c?.phone || '—';
      },
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', width: 120,
      render: (v: number) => <Text strong style={{ color: '#818cf8' }}>{fmt(v)}</Text>,
    },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 100, render: (v: string) => v || '—' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (s: string) => {
        const cfg = STATUS_MAP[s];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{s}</Tag>;
      },
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 100,
      render: (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : '—',
    },
    {
      title: '', key: 'action', width: 80,
      render: (_: any, r: any) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => setDetail(r)}>Chi tiết</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Đơn hàng</Title>
        <Text type="secondary">{total} đơn hàng</Text>
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `Tổng ${t} đơn hàng`,
        }}
        locale={{ emptyText: 'Không có đơn hàng' }}
        title={() => (
          <Space wrap>
            <Input
              placeholder="Tìm ID đơn hàng..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ maxWidth: 240 }}
            />
            <Select
              value={filterStatus}
              onChange={(v) => { setFilterStatus(v); setPage(1); }}
              style={{ minWidth: 160 }}
              placeholder="Tất cả trạng thái"
              allowClear
              onClear={() => { setFilterStatus(''); setPage(1); }}
            >
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.label}</Select.Option>
              ))}
            </Select>
          </Space>
        )}
      />

      <Modal
        title={`Đơn hàng #${detail?.id}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={640}
      >
        {detail && (() => {
          const c = parseJSON(detail.customerJson ?? detail.customer);
          const items = detail.orderItems ?? detail.items ?? [];
          return (
            <div>
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Cập nhật trạng thái</Text>
                <Space wrap>
                  {Object.entries(STATUS_MAP).map(([k, v]) => (
                    <Button
                      key={k}
                      type={detail.status === k ? "primary" : "default"}
                      size="small"
                      onClick={() => updateStatus(detail.id, k)}
                    >
                      {v.label}
                    </Button>
                  ))}
                </Space>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Descriptions title="📋 Thông tin khách hàng" column={2} size="small" bordered>
                <Descriptions.Item label="Tên">{c?.name || c?.fullName || '—'}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{c?.phone || '—'}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {c?.address || detail.shippingAddress || '—'}
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '12px 0' }} />

              <Text strong style={{ display: 'block', marginBottom: 8 }}>🛍️ Sản phẩm</Text>
              {items.map((item: any, i: number) => {
                const product = item.product || item;
                const name = product?.name || item.product_name || `SP #${product?.id || item.product_id || i + 1}`;
                const image = product?.image || item.image || null;
                const quantity = item.quantity || 0;
                const price = item.price ?? product?.price ?? 0;

                return (
                  <Card key={i} size="small" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {image && (
                        <img src={image} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <Text strong>{name}</Text>
                        <br />
                        <Text type="secondary">Size: {item.size || '—'} · SL: {quantity}</Text>
                      </div>
                      <Text strong style={{ color: '#818cf8' }}>{fmt(Number(price) * Number(quantity))}</Text>
                    </div>
                  </Card>
                );
              })}

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Tạm tính', fmt(detail.subTotal)],
                  ['Phí ship', fmt(detail.shippingFee)],
                  ['Giảm giá', `- ${fmt(detail.discountAmount ?? detail.discount ?? 0)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">{k}</Text>
                    <Text>{v}</Text>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <Text strong>Tổng cộng</Text>
                  <Text strong style={{ color: '#818cf8', fontSize: 16 }}>{fmt(detail.totalAmount ?? detail.total_amount ?? 0)}</Text>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
