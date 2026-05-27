
import { useEffect, useState, useCallback } from "react";
import { get, post, put as putReq, del } from "@/services/http";

interface Coupon {
  id: number;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number | null;
  isActive: boolean | null;
  createdAt: string | null;
}

const EMPTY: Omit<Coupon, "id" | "usedCount" | "createdAt"> = {
  code: "",
  discountType: "percent",
  discountValue: 10,
  minOrderValue: 0,
  maxDiscountAmount: null,
  startDate: null,
  endDate: null,
  usageLimit: null,
  isActive: true,
};

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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

  const openCreate = () => { setForm(EMPTY); setModal("create"); setEditId(null); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderValue: c.minOrderValue, maxDiscountAmount: c.maxDiscountAmount,
      startDate: c.startDate, endDate: c.endDate, usageLimit: c.usageLimit, isActive: c.isActive,
    });
    setModal("edit"); setEditId(c.id);
  };
  const closeModal = () => setModal(null);

  const save = async () => {
    if (!form.code) return;
    setSaving(true);
    try {
      if (modal === "create") {
        await post("/coupons", form);
      } else {
        await putReq(`/coupons/${editId}`, form);
      }
      setAlert({ type: "success", msg: "Đã lưu coupon!" });
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
    if (!confirm("Xóa coupon này?")) return;
    try {
      await del(`/coupons/${id}`);
      setAlert({ type: "success", msg: "Đã xóa!" });
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
    }
    setTimeout(() => setAlert(null), 3000);
  };

  const toggle = async (id: number, val: boolean) => {
    try {
      const target = coupons.find(c => c.id === id);
      if (!target) return;
      await putReq(`/coupons/${id}`, { ...target, isActive: val });
      setCoupons(cs => cs.map(c => c.id === id ? { ...c, isActive: val } : c));
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
      setTimeout(() => setAlert(null), 3000);
    }
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
                    <span className={`badge ${c.discountType === "percent" ? "badge-info" : "badge-purple"}`}>
                      {c.discountType === "percent" ? "%" : "Cố định"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#34d399" }}>
                    {c.discountType === "percent" ? `${c.discountValue}%` : `${(c.discountValue || 0).toLocaleString()}₫`}
                  </td>
                  <td>{c.minOrderValue ? c.minOrderValue.toLocaleString() + "₫" : "—"}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>{fmtDate(c.endDate)}</td>
                  <td>
                    {c.usageLimit
                      ? <span style={{ color: "#94a3b8" }}>{c.usedCount || 0}/{c.usageLimit}</span>
                      : <span style={{ color: "#64748b" }}>Không giới hạn</span>}
                  </td>
                  <td>
                    <button
                      className={`badge ${c.isActive ? "badge-success" : "badge-gray"}`}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => toggle(c.id, !c.isActive)}>
                      {c.isActive ? "Hoạt động" : "Tắt"}
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
                  <select className="form-control" value={form.discountType}
                    onChange={e => f("discountType", e.target.value)}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Cố định (₫)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giá trị</label>
                  <input className="form-control" type="number" value={form.discountValue}
                    onChange={e => f("discountValue", Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn tối thiểu (₫)</label>
                  <input className="form-control" type="number" value={form.minOrderValue || ""}
                    onChange={e => f("minOrderValue", Number(e.target.value))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giảm tối đa (₫)</label>
                  <input className="form-control" type="number" value={form.maxDiscountAmount || ""}
                    onChange={e => f("maxDiscountAmount", Number(e.target.value))} placeholder="Không giới hạn" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input className="form-control" type="datetime-local"
                    value={form.startDate || ""}
                    onChange={e => f("startDate", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc</label>
                  <input className="form-control" type="datetime-local"
                    value={form.endDate || ""}
                    onChange={e => f("endDate", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới hạn sử dụng</label>
                  <input className="form-control" type="number" value={form.usageLimit || ""}
                    onChange={e => f("usageLimit", e.target.value ? Number(e.target.value) : null)} placeholder="Không giới hạn" />
                </div>
                <div className="form-group">
                  <label className="form-check" style={{ marginTop: 28 }}>
                    <input type="checkbox" checked={Boolean(form.isActive)}
                      onChange={e => f("isActive", e.target.checked)} />
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
