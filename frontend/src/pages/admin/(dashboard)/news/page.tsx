
import { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Button, Modal, Form, Input, Space, Popconfirm, message, Spin, Typography, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { get, post, patch as patchReq, del } from "@/services/http";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface News {
  id: number; title: string | null; excerpt: string | null; image: string | null;
  publishedAt: string | null; content: string | null; author: string | null; slug: string | null;
}

const INITIAL: any = { title: null, excerpt: null, image: null, publishedAt: null, content: null, author: null, slug: null };

const toDatetimeLocalValue = (value: string | null | undefined) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const buildFormData = (values: any, imageFile: File | null) => {
  const formData = new FormData();
  Object.entries(values || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    formData.append(key, String(value));
  });
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  return formData;
};

export default function NewsAdmin() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data: News[] = await get("/news");
      data.sort((a, b) => b.id - a.id);
      setNews(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    setImageFile(null);
    setImagePreview('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (n: News) => {
    setEditId(n.id);
    setImageFile(null);
    setImagePreview(n.image || '');
    form.setFieldsValue({
      ...n,
      publishedAt: toDatetimeLocalValue(n.publishedAt),
    });
    setModalOpen(true);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!values.title) return;
    setSaving(true);
    try {
      const payload = buildFormData(values, imageFile);
      if (editId) {
        await patchReq(`/news/${editId}`, payload);
        message.success("Đã lưu bài viết!");
      } else {
        await post("/news", payload);
        message.success("Đã thêm bài viết!");
      }
      setModalOpen(false);
      setImageFile(null);
      setImagePreview('');
      fetchData();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await del(`/news/${id}`);
    message.success("Đã xóa!");
    fetchData();
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : '—';

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Tin tức</Title>
          <Text type="secondary">{news.length} bài viết</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm bài viết</Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : news.length === 0 ? (
        <Empty description="Chưa có bài viết nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {news.map(n => (
            <Col xs={24} sm={12} lg={8} key={n.id}>
              <Card
                hoverable
                cover={n.image && (
                  <img alt={n.title || ''} src={n.image} style={{ height: 180, objectFit: 'cover' }} />
                )}
                actions={[
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(n)}>Sửa</Button>,
                  <Popconfirm title="Xóa bài viết này?" onConfirm={() => remove(n.id)} okText="Xóa" cancelText="Hủy">
                    <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>,
                ]}
              >
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  {fmtDate(n.publishedAt)}
                </Text>
                <Title level={5} style={{ margin: '0 0 8px', lineHeight: 1.4 }}>{n.title}</Title>
                <Text type="secondary" style={{ fontSize: 13 }} ellipsis={{ tooltip: n.excerpt }}>
                  {n.excerpt}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editId ? "Sửa bài viết" : "Thêm bài viết"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
        width={680}
      >
        <Form form={form} layout="vertical" initialValues={INITIAL}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <Input placeholder="Tiêu đề bài viết..." />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="tin-tuc-moi" />
          </Form.Item>
          <Form.Item name="excerpt" label="Tóm tắt">
            <TextArea rows={3} placeholder="Tóm tắt nội dung..." />
          </Form.Item>
          <Form.Item label="Ảnh bài viết">
            <Input type="file" accept="image/*" onChange={handleImageSelect} />
            {imagePreview ? (
              <div style={{ marginTop: 12 }}>
                <img
                  src={imagePreview}
                  alt="Xem trước ảnh bài viết"
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' }}
                />
              </div>
            ) : null}
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="author" label="Tác giả" style={{ flex: 1 }}>
              <Input placeholder="ZestFoot" />
            </Form.Item>
            <Form.Item name="publishedAt" label="Ngày đăng" style={{ flex: 1 }}>
              <Input type="datetime-local" />
            </Form.Item>
          </Space>
          <Form.Item name="content" label="Nội dung">
            <TextArea rows={6} placeholder="Nội dung đầy đủ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
