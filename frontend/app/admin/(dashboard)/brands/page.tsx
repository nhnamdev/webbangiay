
import { useEffect, useState, useCallback } from "react";
import { supabaseAdmin } from "../../supabaseClient";

interface Brand { id: number; name: string; logo: string | null; slug: string | null; }

const EMPTY: Omit<Brand, "id"> = { name: "", logo: null, slug: null };

export default function BrandsAdmin() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Omit<Brand, "id">>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabaseAdmin.from("brands").select("*");
    if (search) q = q.ilike("name", `%${search}%`);
    const { data } = await q.order("name");
    setBrands(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY); setModal("create"); setEditId(null); };
  const openEdit = (b: Brand) => { setForm({ name: b.name, logo: b.logo, slug: b.slug }); setModal("edit"); setEditId(b.id); };
  const closeModal = () => setModal(null);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    let err;
    if (modal === "create") {
      ({ error: err } = await supabaseAdmin.from("brands").insert([form]));
    } else {
      ({ error: err } = await supabaseAdmin.from("brands").update(form).eq("id", editId!));
    }
    setSaving(false);
    if (err) setAlert({ type: "error", msg: err.message });
    else { setAlert({ type: "success", msg: modal === "create" ? "Đã thêm thương hiệu!" : "Đã cập nhật!" }); closeModal(); fetch(); }
    setTimeout(() => setAlert(null), 3000);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa thương hiệu này?")) return;
    const { error } = await supabaseAdmin.from("brands").delete().eq("id", id);
    if (error) setAlert({ type: "error", msg: error.message });
    else { setAlert({ type: "success", msg: "Đã xóa!" }); fetch(); }
    setTimeout(() => setAlert(null), 3000);
  };

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thương hiệu</h1>
          <p className="page-subtitle">{brands.length} thương hiệu</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm thương hiệu</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="search-icon">🔍</span>
            <input placeholder="Tìm thương hiệu..." value={search} onChange={e => { setSearch(e.target.value); }} />
          </div>
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : brands.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏷️</span>
            <span className="empty-title">Không tìm thấy thương hiệu</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Logo</th>
                <th>Tên thương hiệu</th>
                <th>Slug</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, background: "#fff", padding: 4 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>🏷️</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{b.name}</td>
                  <td><span style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13 }}>{b.slug || "—"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-icon" onClick={() => openEdit(b)}>✏️</button>
                      <button className="btn-icon danger" onClick={() => remove(b.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === "create" ? "Thêm thương hiệu" : "Sửa thương hiệu"}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label className="form-label">Tên thương hiệu *</label>
                  <input className="form-control" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Nike, Adidas..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-control" value={form.slug || ""} onChange={e => f("slug", e.target.value)} placeholder="nike, adidas..." />
                </div>
                <div className="form-group">
                  <label className="form-label">URL Logo</label>
                  <input className="form-control" value={form.logo || ""} onChange={e => f("logo", e.target.value)} placeholder="https://..." />
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
