
import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Switch, Space, Popconfirm, message, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { get, post, put as putReq, del } from "@/services/http";

const { Title, Text } = Typography;

interface Coupon {
  id: number; code: string; discountType: "percent" | "fixed"; discountValue: number;
  minOrderValue: number | null; maxDiscountAmount: number | null;
  startDate: string | null; endDate: string | null;
  usageLimit: number | null; usedCount: number | null;
  isActive: boolean | null; createdAt: string | null;
}

const INITIAL: any = {
  code: "", discountType: "percent", discountValue: 10, minOrderValue: 0,
  maxDiscountAmount: null, startDate: null, endDate: null, usageLimit: null, isActive: true,
};

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data: Coupon[] = await get("/coupons");
      data.sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
      setCoupons(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditId(null); form.resetFields(); setModalOpen(true); };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    form.setFieldsValue(c);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!values.code) return;
    setSaving(true);
    try {
      if (editId) {
        await putReq(`/coupons/${editId}`, values);
        message.success("Đã lưu coupon!");
      } else {
        await post("/coupons", values);
        message.success("Đã tạo coupon!");
      }
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await del(`/coupons/${id}`);
      message.success("Đã xóa!");
      fetchData();
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    }
  };

  const toggle = async (id: number, val: boolean) => {
    const target = coupons.find(c => c.id === id);
    if (!target) return;
    try {
      await putReq(`/coupons/${id}`, { ...target, isActive: val });
      setCoupons(cs => cs.map(c => c.id === id ? { ...c, isActive: val } : c));
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    }
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : '—';

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', render: (v: string) => <Text code strong style={{ color: '#818cf8', fontSize: 14 }}>{v}</Text> },
    {
      title: 'Loại', dataIndex: 'discountType', key: 'discountType',
      render: (v: string) => <Tag color={v === 'percent' ? 'blue' : 'purple'}>{v === 'percent' ? '%' : 'Cố định'}</Tag>,
    },
    {
      title: 'Giá trị', key: 'value',
      render: (_: any, r: Coupon) => (
        <Text strong style={{ color: '#52c41a' }}>
          {r.discountType === 'percent' ? `${r.discountValue}%` : `${(r.discountValue || 0).toLocaleString()}₫`}
        </Text>
      ),
    },
    {
      title: 'Đơn tối thiểu', dataIndex: 'minOrderValue', key: 'minOrderValue',
      render: (v: number | null) => v ? `${v.toLocaleString()}₫` : '—',
    },
    { title: 'Hạn dùng', dataIndex: 'endDate', key: 'endDate', render: (d: string | null) => fmtDate(d) },
    {
      title: 'Đã dùng', key: 'used',
      render: (_: any, r: Coupon) => r.usageLimit
        ? `${r.usedCount || 0}/${r.usageLimit}`
        : <Text type="secondary">Không giới hạn</Text>,
    },
    {
      title: 'Trạng thái', key: 'status',
      render: (_: any, r: Coupon) => (
        <Switch
          checked={!!r.isActive}
          onChange={(v) => toggle(r.id, v)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: '', key: 'action',
      render: (_: any, r: Coupon) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xóa coupon này?" onConfirm={() => remove(r.id)} okText="Xóa" cancelText="Hủy">
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Mã giảm giá</Title>
          <Text type="secondary">{coupons.length} coupon</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo coupon</Button>
      </div>

      <Table dataSource={coupons} columns={columns} rowKey="id" loading={loading} size="middle" pagination={false}
        locale={{ emptyText: 'Chưa có coupon nào' }} />

      <Modal
        title={editId ? "Sửa coupon" : "Tạo coupon"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" initialValues={INITIAL}>
          <Form.Item name="code" label="Mã coupon" rules={[{ required: true, message: 'Nhập mã coupon' }]}>
            <Input placeholder="SUMMER2024" style={{ textTransform: 'uppercase' }}
              onChange={(e) => form.setFieldValue('code', e.target.value.toUpperCase())} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="discountType" label="Loại giảm giá" style={{ flex: 1 }}>
              <Select>
                <Select.Option value="percent">Phần trăm (%)</Select.Option>
                <Select.Option value="fixed">Cố định (₫)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="discountValue" label="Giá trị" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="minOrderValue" label="Đơn tối thiểu (₫)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>
            <Form.Item name="maxDiscountAmount" label="Giảm tối đa (₫)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Không giới hạn" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="startDate" label="Ngày bắt đầu" style={{ flex: 1 }}>
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" style={{ flex: 1 }}>
              <Input type="datetime-local" />
            </Form.Item>
          </Space>
          <Form.Item name="usageLimit" label="Giới hạn sử dụng">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Không giới hạn" />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
