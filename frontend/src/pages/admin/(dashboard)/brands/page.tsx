
import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { get, post, put as putReq, del } from "@/services/http";

const { Title, Text } = Typography;

interface Brand { id: number; name: string; logo: string | null; slug: string | null; }
const EMPTY: Omit<Brand, "id"> = { name: "", logo: null, slug: null };

export default function BrandsAdmin() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all: Brand[] = await get("/brands");
      const filtered = search
        ? all.filter(b => (b.name || "").toLowerCase().includes(search.toLowerCase()))
        : all;
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setBrands(filtered);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditId(b.id);
    form.setFieldsValue(b);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!values.name) return;
    setSaving(true);
    try {
      if (editId) {
        await putReq(`/brands/${editId}`, values);
        message.success("Đã cập nhật!");
      } else {
        await post("/brands", values);
        message.success("Đã thêm thương hiệu!");
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
      await del(`/brands/${id}`);
      message.success("Đã xóa!");
      fetchData();
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, render: (id: number) => <Text code>#{id}</Text> },
    {
      title: 'Logo', key: 'logo', width: 60,
      render: (_: any, r: Brand) => r.logo
        ? <img src={r.logo} alt={r.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#fff', padding: 4 }} />
        : <span style={{ fontSize: 20 }}>🏷️</span>,
    },
    { title: 'Tên thương hiệu', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v: string | null) => v ? <Text code>{v}</Text> : '—' },
    {
      title: '', key: 'action', width: 80,
      render: (_: any, r: Brand) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xóa thương hiệu này?" onConfirm={() => remove(r.id)} okText="Xóa" cancelText="Hủy">
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
          <Title level={4} style={{ margin: 0 }}>Thương hiệu</Title>
          <Text type="secondary">{brands.length} thương hiệu</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm thương hiệu</Button>
      </div>

      <Table
        dataSource={brands}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: 'Không tìm thấy thương hiệu' }}
        title={() => (
          <Input
            placeholder="Tìm thương hiệu..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 320 }}
          />
        )}
      />

      <Modal
        title={editId ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" initialValues={EMPTY}>
          <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true, message: 'Nhập tên thương hiệu' }]}>
            <Input placeholder="Nike, Adidas..." />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="nike, adidas..." />
          </Form.Item>
          <Form.Item name="logo" label="URL Logo">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
