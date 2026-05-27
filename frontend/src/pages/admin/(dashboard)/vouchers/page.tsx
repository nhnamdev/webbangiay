
import { useEffect, useState, useCallback } from "react";
import { get, post, put as putReq } from "@/services/http";

const PAGE_SIZE = 15;

export default function VouchersAdmin() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    userId: "", code: "", discountAmount: 50000, minOrderValue: 0, status: "active", expiresAt: ""
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all: any[] = await get("/vouchers");
      let list = all;
      if (filterStatus) list = list.filter(v => v.status === filterStatus);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTotal(list.length);
      setVouchers(list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    if (!form.userId || !form.code) return;
    setSaving(true);
    try {
      await post("/vouchers", {
        userId: Number(form.userId),
        code: form.code,
        discountAmount: form.discountAmount,
        minOrderValue: form.minOrderValue,
        status: form.status,
        expiresAt: form.expiresAt || null,
      });
      setAlert({ type: "success", msg: "Đã tặng voucher!" });
      setModal(false);
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const target = vouchers.find(v => v.id === id);
      if (!target) return;
      await putReq(`/vouchers/${id}`, { ...target, status });
      setVouchers(vs => vs.map(v => v.id === id ? { ...v, status } : v));
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const statusBadge = (s: string) =>
    s === "active" ? "badge-success" : s === "used" ? "badge-warning" : "badge-gray";
  const statusLabel = (s: string) =>
    s === "active" ? "Hoạt động" : s === "used" ? "Đã dùng" : s === "expired" ? "Hết hạn" : s;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Voucher người dùng</h1>
          <p className="page-subtitle">{total} voucher</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>＋ Tặng voucher</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <select className="form-control" style={{ minWidth: 160 }} value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="used">Đã dùng</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : vouchers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎁</span>
            <span className="empty-title">Không có voucher nào</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Mã voucher</th>
                <th>Giảm giá</th>
                <th>Đơn tối thiểu</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td style={{ color: "#cbd5e1" }}>#{v.userId}</td>
                  <td><span style={{ fontFamily: "monospace", color: "#818cf8", fontWeight: 700 }}>{v.code}</span></td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>{(v.discountAmount || 0).toLocaleString()}₫</td>
                  <td>{v.minOrderValue ? v.minOrderValue.toLocaleString() + "₫" : "—"}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString("vi-VN") : "Không hạn"}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(v.status)}`}>{statusLabel(v.status)}</span>
                  </td>
                  <td>
                    <select className="form-control" style={{ fontSize: 12, padding: "4px 8px", minWidth: 120 }}
                      value={v.status} onChange={e => updateStatus(v.id, e.target.value)}>
                      <option value="active">Hoạt động</option>
                      <option value="used">Đã dùng</option>
                      <option value="expired">Hết hạn</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Trang {page}/{totalPages}</span>
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
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Tặng voucher cho người dùng</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label className="form-label">ID người dùng *</label>
                  <input className="form-control" value={form.userId} onChange={e => f("userId", e.target.value)} placeholder="VD: 12" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mã voucher *</label>
                  <input className="form-control" value={form.code} onChange={e => f("code", e.target.value.toUpperCase())} placeholder="GIFT2024" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tiền giảm (₫)</label>
                  <input className="form-control" type="number" value={form.discountAmount} onChange={e => f("discountAmount", Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn tối thiểu (₫)</label>
                  <input className="form-control" type="number" value={form.minOrderValue} onChange={e => f("minOrderValue", Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hết hạn</label>
                  <input className="form-control" type="datetime-local" value={form.expiresAt} onChange={e => f("expiresAt", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Tặng voucher"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
