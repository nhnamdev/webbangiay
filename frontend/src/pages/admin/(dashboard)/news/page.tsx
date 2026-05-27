
import { useEffect, useState, useCallback } from "react";
import { get, post, put as putReq, del } from "@/services/http";

interface News {
  id: number;
  title: string | null;
  excerpt: string | null;
  image: string | null;
  publishedAt: string | null;
  content: string | null;
  author: string | null;
  slug: string | null;
}

const EMPTY: Omit<News, "id"> = { title: null, excerpt: null, image: null, publishedAt: null, content: null, author: null, slug: null };

export default function NewsAdmin() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Omit<News, "id">>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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

  const openCreate = () => { setForm(EMPTY); setModal("create"); setEditId(null); };
  const openEdit = (n: News) => { setForm({ title: n.title, excerpt: n.excerpt, image: n.image, publishedAt: n.publishedAt, content: n.content, author: n.author, slug: n.slug }); setModal("edit"); setEditId(n.id); };
  const closeModal = () => setModal(null);

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (modal === "create") {
        await post("/news", form);
      } else {
        await putReq(`/news/${editId}`, form);
      }
      setAlert({ type: "success", msg: "Đã lưu bài viết!" });
      closeModal();
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa bài viết này?")) return;
    await del(`/news/${id}`);
    fetchData();
  };

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tin tức</h1>
          <p className="page-subtitle">{news.length} bài viết</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm bài viết</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : news.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📰</span>
            <span className="empty-title">Chưa có bài viết nào</span>
          </div>
        ) : (
          news.map(n => (
            <div key={n.id} style={{
              background: "linear-gradient(135deg, #1e2235, #1a1d2e)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: 16, overflow: "hidden",
              transition: "all 0.3s"
            }}>
              {n.image && (
                <img src={n.image} alt={n.title || ""} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              )}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("vi-VN") : "—"}
                </div>
                <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8, lineHeight: 1.4 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 16,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {n.excerpt}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => openEdit(n)}>✏️ Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(n.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === "create" ? "Thêm bài viết" : "Sửa bài viết"}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label className="form-label">Tiêu đề *</label>
                  <input className="form-control" value={form.title || ""} onChange={e => f("title", e.target.value)} placeholder="Tiêu đề bài viết..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-control" value={form.slug || ""} onChange={e => f("slug", e.target.value)} placeholder="tin-tuc-moi" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tóm tắt</label>
                  <textarea className="form-control" value={form.excerpt || ""} onChange={e => f("excerpt", e.target.value)} placeholder="Tóm tắt nội dung..." style={{ minHeight: 80 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">URL ảnh</label>
                  <input className="form-control" value={form.image || ""} onChange={e => f("image", e.target.value)} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Tác giả</label>
                  <input className="form-control" value={form.author || ""} onChange={e => f("author", e.target.value)} placeholder="ZestFoot" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày đăng</label>
                  <input className="form-control" type="datetime-local" value={form.publishedAt || ""} onChange={e => f("publishedAt", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nội dung</label>
                  <textarea className="form-control" value={form.content || ""} onChange={e => f("content", e.target.value)} placeholder="Nội dung đầy đủ..." style={{ minHeight: 160 }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
