
import { useEffect, useState, useCallback } from "react";
import { get, post } from "../../../../services/http";

const PAGE_SIZE = 15;

export default function PointsAdmin() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ userId: "", amount: 100, reason: "", type: "earn" as "earn" | "spend" });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const users: any = await get("/users", { params: { page: 1, size: 200 } });
      const transactionsList: any[] = [];
      await Promise.all((users.data || []).map(async (u: any) => {
        const txs = await get(`/points/user/${u.id}/transactions`).catch(() => []);
        txs.forEach((t: any) => transactionsList.push({ ...t, _user: u }));
      }));
      let list = transactionsList;
      if (filterType) list = list.filter(t => t.type === filterType);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTotal(list.length);
      setTransactions(list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, [filterType, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    if (!form.userId || !form.reason || !form.amount) return;
    setSaving(true);
    try {
      await post(`/points/user/${form.userId}`, {
        type: form.type,
        amount: form.amount,
        reason: form.reason,
      });
      setAlert({ type: "success", msg: "Đã ghi nhận giao dịch điểm!" });
      setModal(false);
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Điểm thưởng</h1>
          <p className="page-subtitle">{total} giao dịch điểm</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>＋ Giao dịch thủ công</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <select className="form-control" style={{ minWidth: 160 }} value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="earn">Cộng điểm</option>
            <option value="spend">Trừ điểm</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">⭐</span>
            <span className="empty-title">Chưa có giao dịch điểm</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Người dùng</th>
                <th>Loại</th>
                <th>Điểm</th>
                <th>Lý do</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td style={{ color: "#cbd5e1" }}>{t._user?.fullName || t._user?.email || `#${t.userId}`}</td>
                  <td>
                    <span className={`badge ${t.type === "earn" ? "badge-success" : "badge-danger"}`}>
                      {t.type === "earn" ? "Cộng điểm" : "Trừ điểm"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: t.type === "earn" ? "#34d399" : "#f87171" }}>
                      {t.type === "earn" ? "+" : "-"}{t.amount}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", maxWidth: 280 }}>{t.reason}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleString("vi-VN") : "—"}
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
              <span className="modal-title">Giao dịch điểm thủ công</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label className="form-label">ID người dùng *</label>
                  <input className="form-control" value={form.userId} onChange={e => f("userId", e.target.value)} placeholder="VD: 12" />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại giao dịch</label>
                  <select className="form-control" value={form.type} onChange={e => f("type", e.target.value)}>
                    <option value="earn">Cộng điểm</option>
                    <option value="spend">Trừ điểm</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Số điểm *</label>
                  <input className="form-control" type="number" min={1} value={form.amount} onChange={e => f("amount", Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lý do *</label>
                  <input className="form-control" value={form.reason} onChange={e => f("reason", e.target.value)} placeholder="Thưởng đánh giá sản phẩm..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Xác nhận"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
