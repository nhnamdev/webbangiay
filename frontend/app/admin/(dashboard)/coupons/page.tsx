
import { useEffect, useState, useCallback } from "react";
import { supabaseAdmin } from "../../supabaseClient";

interface Coupon {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  max_discount_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

const EMPTY: Omit<Coupon, "id" | "used_count" | "created_at"> = {
  code: "",
  discount_type: "percent",
  discount_value: 10,
  min_order_value: 0,
  max_discount_amount: null,
  start_date: null,
  end_date: null,
  usage_limit: null,
  is_active: true,
};

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY); setModal("create"); setEditId(null); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
      min_order_value: c.min_order_value, max_discount_amount: c.max_discount_amount,
      start_date: c.start_date, end_date: c.end_date, usage_limit: c.usage_limit, is_active: c.is_active,
    });
    setModal("edit"); setEditId(c.id);
  };
  const closeModal = () => setModal(null);

  const save = async () => {
    if (!form.code) return;
    setSaving(true);
    let err;
    if (modal === "create") {
      ({ error: err } = await supabaseAdmin.from("coupons").insert([form]));
    } else {
      ({ error: err } = await supabaseAdmin.from("coupons").update(form).eq("id", editId!));
    }
    setSaving(false);
    if (err) setAlert({ type: "error", msg: err.message });
    else { setAlert({ type: "success", msg: "Đã lưu coupon!" }); closeModal(); fetch(); }
    setTimeout(() => setAlert(null), 3000);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa coupon này?")) return;
    await supabaseAdmin.from("coupons").delete().eq("id", id);
    setAlert({ type: "success", msg: "Đã xóa!" }); fetch();
    setTimeout(() => setAlert(null), 3000);
  };

  const toggle = async (id: number, val: boolean) => {
    await supabaseAdmin.from("coupons").update({ is_active: val }).eq("id", id);
    setCoupons(cs => cs.map(c => c.id === id ? { ...c, is_active: val } : c));
  };

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mã giảm giá</h1>
          <p className="page-subtitle">{coupons.length} coupon</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo coupon</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎟️</span>
            <span className="empty-title">Chưa có coupon nào</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Hạn dùng</th>
                <th>Đã dùng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", color: "#818cf8", fontWeight: 700, fontSize: 14 }}>
                      {c.code}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.discount_type === "percent" ? "badge-info" : "badge-purple"}`}>
                      {c.discount_type === "percent" ? "%" : "Cố định"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#34d399" }}>
                    {c.discount_type === "percent" ? `${c.discount_value}%` : `${c.discount_value?.toLocaleString()}₫`}
                  </td>
                  <td>{c.min_order_value ? c.min_order_value.toLocaleString() + "₫" : "—"}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>{fmtDate(c.end_date)}</td>
                  <td>
                    {c.usage_limit
                      ? <span style={{ color: "#94a3b8" }}>{c.used_count || 0}/{c.usage_limit}</span>
                      : <span style={{ color: "#64748b" }}>Không giới hạn</span>}
                  </td>
                  <td>
                    <button
                      className={`badge ${c.is_active ? "badge-success" : "badge-gray"}`}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => toggle(c.id, !c.is_active)}>
                      {c.is_active ? "Hoạt động" : "Tắt"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-icon" onClick={() => openEdit(c)}>✏️</button>
                      <button className="btn-icon danger" onClick={() => remove(c.id)}>🗑️</button>
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
              <span className="modal-title">{modal === "create" ? "Tạo coupon" : "Sửa coupon"}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Mã coupon *</label>
                  <input className="form-control" value={form.code}
                    onChange={e => f("code", e.target.value.toUpperCase())} placeholder="SUMMER2024" />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại giảm giá</label>
                  <select className="form-control" value={form.discount_type}
                    onChange={e => f("discount_type", e.target.value)}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Cố định (₫)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giá trị</label>
                  <input className="form-control" type="number" value={form.discount_value}
                    onChange={e => f("discount_value", Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn tối thiểu (₫)</label>
                  <input className="form-control" type="number" value={form.min_order_value || ""}
                    onChange={e => f("min_order_value", Number(e.target.value))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giảm tối đa (₫)</label>
                  <input className="form-control" type="number" value={form.max_discount_amount || ""}
                    onChange={e => f("max_discount_amount", Number(e.target.value))} placeholder="Không giới hạn" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input className="form-control" type="datetime-local"
                    value={form.start_date || ""}
                    onChange={e => f("start_date", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc</label>
                  <input className="form-control" type="datetime-local"
                    value={form.end_date || ""}
                    onChange={e => f("end_date", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới hạn sử dụng</label>
                  <input className="form-control" type="number" value={form.usage_limit || ""}
                    onChange={e => f("usage_limit", e.target.value ? Number(e.target.value) : null)} placeholder="Không giới hạn" />
                </div>
                <div className="form-group">
                  <label className="form-check" style={{ marginTop: 28 }}>
                    <input type="checkbox" checked={Boolean(form.is_active)}
                      onChange={e => f("is_active", e.target.checked)} />
                    <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>Kích hoạt ngay</span>
                  </label>
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
