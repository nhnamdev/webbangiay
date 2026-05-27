
import { useEffect, useState, useCallback } from "react";
import { get, post, put as putReq, del } from "@/services/http";

interface Product {
  id: number;
  name: string;
  brand: string | null;
  price: number | null;
  salePrice: number | null;
  image: string | null;
  isNew: boolean | null;
  isSale: boolean | null;
  isTrending: boolean | null;
  isAsicsExclusive: boolean | null;
  category: string | null;
  subCategory: string | null;
  gender: string | null;
}

const EMPTY: Omit<Product, "id"> = {
  name: "",
  brand: null,
  price: null,
  salePrice: null,
  image: null,
  isNew: false,
  isSale: false,
  isTrending: false,
  isAsicsExclusive: false,
  category: null,
  subCategory: null,
  gender: null,
};

const PAGE_SIZE = 10;

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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

  const openCreate = () => { setForm(EMPTY); setModal("create"); setEditId(null); };
  const openEdit = (p: Product) => { setForm({ ...p }); setModal("edit"); setEditId(p.id); };
  const closeModal = () => { setModal(null); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (modal === "create") {
        await post("/products", form);
      } else {
        await putReq(`/products/${editId}`, form);
      }
      setAlert({ type: "success", msg: modal === "create" ? "Đã thêm sản phẩm!" : "Đã cập nhật!" });
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
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await del(`/products/${id}`);
      setAlert({ type: "success", msg: "Đã xóa sản phẩm" });
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
    }
    setTimeout(() => setAlert(null), 3000);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const f = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sản phẩm</h1>
          <p className="page-subtitle">{total} sản phẩm trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm sản phẩm</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /><div className="loading-text">Đang tải...</div></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👟</span>
            <span className="empty-title">Không tìm thấy sản phẩm</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Giá</th>
                <th>Giá sale</th>
                <th>Danh mục</th>
                <th>Giới tính</th>
                <th>Tags</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="product-img" />
                    ) : (
                      <div className="product-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>👟</div>
                    )}
                  </td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                  <td>{p.brand || "—"}</td>
                  <td>{p.price ? p.price.toLocaleString("vi-VN") + "₫" : "—"}</td>
                  <td>{p.salePrice ? p.salePrice.toLocaleString("vi-VN") + "₫" : "—"}</td>
                  <td>{p.category || "—"}</td>
                  <td>{p.gender || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {p.isNew && <span className="badge badge-success">Mới</span>}
                      {p.isSale && <span className="badge badge-warning">Sale</span>}
                      {p.isTrending && <span className="badge badge-info">Trending</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-icon" onClick={() => openEdit(p)} title="Sửa">✏️</button>
                      <button className="btn-icon danger" onClick={() => remove(p.id)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Trang {page}/{totalPages} · {total} sản phẩm</span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>◀</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>;
              })}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>▶</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input className="form-control" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Tên sản phẩm..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Thương hiệu</label>
                  <input className="form-control" value={form.brand || ""} onChange={e => f("brand", e.target.value)} placeholder="Nike, Adidas..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <input className="form-control" value={form.category || ""} onChange={e => f("category", e.target.value)} placeholder="running, lifestyle..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá (₫)</label>
                  <input className="form-control" type="number" value={form.price || ""} onChange={e => f("price", Number(e.target.value))} placeholder="1500000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá sale (₫)</label>
                  <input className="form-control" type="number" value={form.salePrice || ""} onChange={e => f("salePrice", Number(e.target.value))} placeholder="1200000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select className="form-control" value={form.gender || ""} onChange={e => f("gender", e.target.value)}>
                    <option value="">-- Chọn --</option>
                    <option value="men">Nam</option>
                    <option value="women">Nữ</option>
                    <option value="unisex">Unisex</option>
                    <option value="kids">Trẻ em</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục phụ</label>
                  <input className="form-control" value={form.subCategory || ""} onChange={e => f("subCategory", e.target.value)} placeholder="sneakers, casual..." />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">URL ảnh</label>
                  <input className="form-control" value={form.image || ""} onChange={e => f("image", e.target.value)} placeholder="https://..." />
                </div>
                <div className="form-group form-full">
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {[
                      { key: "isNew", label: "Mới" },
                      { key: "isSale", label: "Sale" },
                      { key: "isTrending", label: "Trending" },
                      { key: "isAsicsExclusive", label: "ASICS Exclusive" },
                    ].map(({ key, label }) => (
                      <label key={key} className="form-check">
                        <input type="checkbox"
                          checked={Boolean(form[key as keyof typeof form])}
                          onChange={e => f(key as keyof typeof form, e.target.checked)}
                        />
                        <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
