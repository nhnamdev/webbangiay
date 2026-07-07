
import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, message, Spin, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { get, post, put as putReq, del } from "@/services/http";

const { Title, Text } = Typography;

interface Product {
  id: number; name: string; brand: string | null; price: number | null;
  salePrice: number | null; image: string | null; isNew: boolean | null;
  isSale: boolean | null; isTrending: boolean | null; isAsicsExclusive: boolean | null;
  category: string | null; subCategory: string | null; gender: string | null;
}

const EMPTY: Omit<Product, "id"> = {
  name: "", brand: null, price: null, salePrice: null, image: null,
  isNew: false, isSale: false, isTrending: false, isAsicsExclusive: false,
  category: null, subCategory: null, gender: null,
};

const tagColors: Record<string, string> = {
  isNew: 'green', isSale: 'gold', isTrending: 'blue', isAsicsExclusive: 'purple',
};
const tagLabels: Record<string, string> = {
  isNew: 'Mới', isSale: 'Sale', isTrending: 'Trending', isAsicsExclusive: 'ASICS Exclusive',
};

const PAGE_SIZE = 10;

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all: Product[] = await get("/products");
      const filtered = search
        ? all.filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase()))
        : all;
      filtered.sort((a, b) => b.id - a.id);
      setTotal(filtered.length);
      setProducts(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    form.setFieldsValue(p);
    setImageFile(null);
    setImagePreview(p.image || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (file?: File | null) => {
    setImageFile(file || null);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      form.setFieldValue('image', null);
    } else {
      setImagePreview(editId ? form.getFieldValue('image') || null : null);
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!editId && !imageFile) {
      message.error("Vui lòng chọn ảnh sản phẩm từ máy tính");
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        payload.append(key, typeof value === "boolean" ? String(value) : String(value));
      });
      if (imageFile) {
        payload.append("imageFile", imageFile);
      }

      if (editId) {
        await putReq(`/products/${editId}`, payload);
        message.success("Đã cập nhật sản phẩm!");
      } else {
        await post("/products", payload);
        message.success("Đã thêm sản phẩm!");
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await del(`/products/${id}`);
      message.success("Đã xóa sản phẩm");
      fetchData();
    } catch (e: any) {
      message.error(e?.message || "Lỗi");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, render: (id: number) => <Text code>#{id}</Text> },
    {
      title: 'Ảnh', key: 'image', width: 60,
      render: (_: any, r: Product) => r.image
        ? <img src={r.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
        : <span style={{ fontSize: 20 }}>👟</span>,
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand', width: 120, render: (v: string | null) => v || '—' },
    {
      title: 'Giá', dataIndex: 'price', key: 'price', width: 110,
      render: (v: number | null) => v ? v.toLocaleString("vi-VN") + "₫" : '—',
    },
    {
      title: 'Giá sale', dataIndex: 'salePrice', key: 'salePrice', width: 110,
      render: (v: number | null) => v ? <Text type="danger">{v.toLocaleString("vi-VN")}₫</Text> : '—',
    },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 100, render: (v: string | null) => v || '—' },
    {
      title: 'Giới tính', dataIndex: 'gender', key: 'gender', width: 80,
      render: (v: string | null) => {
        if (!v) return '—';
        const map: Record<string, string> = { men: 'Nam', women: 'Nữ', unisex: 'Unisex', kids: 'Trẻ em' };
        return map[v] || v;
      },
    },
    {
      title: 'Tags', key: 'tags', width: 160,
      render: (_: any, r: Product) => (
        <Space size={4} wrap>
          {Object.entries(tagColors).map(([key, color]) =>
            r[key as keyof Product]
              ? <Tag key={key} color={color}>{tagLabels[key]}</Tag>
              : null
          )}
        </Space>
      ),
    },
    {
      title: '', key: 'action', width: 80,
      render: (_: any, r: Product) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => remove(r.id)} okText="Xóa" cancelText="Hủy">
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
          <Title level={4} style={{ margin: 0 }}>Sản phẩm</Title>
          <Text type="secondary">{total} sản phẩm trong hệ thống</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm sản phẩm</Button>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `Tổng ${t} sản phẩm`,
        }}
        locale={{ emptyText: 'Không tìm thấy sản phẩm' }}
        title={() => (
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            allowClear
            style={{ maxWidth: 320 }}
          />
        )}
      />

      <Modal
        title={editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
        width={640}
      >
        <Form form={form} layout="vertical" initialValues={EMPTY}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
            <Input placeholder="Tên sản phẩm..." />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="brand" label="Thương hiệu" style={{ flex: 1 }}>
              <Input placeholder="Nike, Adidas..." />
            </Form.Item>
            <Form.Item name="category" label="Danh mục" style={{ flex: 1 }}>
              <Input placeholder="running, lifestyle..." />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="price" label="Giá (₫)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="1500000" />
            </Form.Item>
            <Form.Item name="salePrice" label="Giá sale (₫)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="1200000" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="gender" label="Giới tính" style={{ flex: 1 }}>
              <Select placeholder="-- Chọn --" allowClear>
                <Select.Option value="men">Nam</Select.Option>
                <Select.Option value="women">Nữ</Select.Option>
                <Select.Option value="unisex">Unisex</Select.Option>
                <Select.Option value="kids">Trẻ em</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="subCategory" label="Danh mục phụ" style={{ flex: 1 }}>
              <Input placeholder="sneakers, casual..." />
            </Form.Item>
          </Space>
          <Form.Item name="image" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Space orientation="vertical" style={{ width: '100%' }} size={12}>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
              />
              {imagePreview && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, border: '1px solid #e5e7eb' }}
                  />
                  <Text type="secondary">
                    {editId ? 'Chọn ảnh mới để thay ảnh hiện tại.' : 'Ảnh sẽ được tải lên R2 và lưu URL vào cơ sở dữ liệu.'}
                  </Text>
                </div>
              )}
            </Space>
          </Form.Item>
          <Form.Item label="Tags">
            <Form.Item name="isNew" valuePropName="checked" style={{ display: 'inline-block', marginBottom: 0 }}>
              <Tag.CheckableTag checked={false} onChange={(c) => form.setFieldValue('isNew', c)}>Mới</Tag.CheckableTag>
            </Form.Item>
            <Form.Item name="isSale" valuePropName="checked" style={{ display: 'inline-block', marginBottom: 0, marginLeft: 8 }}>
              <Tag.CheckableTag checked={false} onChange={(c) => form.setFieldValue('isSale', c)}>Sale</Tag.CheckableTag>
            </Form.Item>
            <Form.Item name="isTrending" valuePropName="checked" style={{ display: 'inline-block', marginBottom: 0, marginLeft: 8 }}>
              <Tag.CheckableTag checked={false} onChange={(c) => form.setFieldValue('isTrending', c)}>Trending</Tag.CheckableTag>
            </Form.Item>
            <Form.Item name="isAsicsExclusive" valuePropName="checked" style={{ display: 'inline-block', marginBottom: 0, marginLeft: 8 }}>
              <Tag.CheckableTag checked={false} onChange={(c) => form.setFieldValue('isAsicsExclusive', c)}>ASICS Exclusive</Tag.CheckableTag>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
