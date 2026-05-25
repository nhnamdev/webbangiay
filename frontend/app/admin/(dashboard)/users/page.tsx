
import { useEffect, useState, useCallback } from "react";
import { supabaseAdmin } from "../../supabaseClient";

const PAGE_SIZE = 10;

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabaseAdmin.from("profiles").select("*", { count: "exact" });
    if (search) q = q.ilike("full_name", `%${search}%`);
    const { data, count } = await q.order("updated_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    setUsers(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const loadDetail = async (user: any) => {
    const [{ data: transactions }, { data: vouchers }, { data: orders }] = await Promise.all([
      supabaseAdmin.from("point_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("user_vouchers").select("*").eq("user_id", user.id),
      supabaseAdmin.from("orders").select("id, total_amount, status, created_at").eq("customer->>id", user.id).limit(5),
    ]);
    setDetail({ ...user, transactions, vouchers, orders });
  };

  const updatePoints = async (userId: string, points: number) => {
    const { error } = await supabaseAdmin.from("profiles").update({ points }).eq("id", userId);
    if (error) setAlert({ type: "error", msg: error.message });
    else { setAlert({ type: "success", msg: "Đã cập nhật điểm!" }); setDetail((d: any) => ({ ...d, points })); fetch(); }
    setTimeout(() => setAlert(null), 3000);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const fmt = (n: any) => Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Người dùng</h1>
          <p className="page-subtitle">{total} người dùng đã đăng ký</p>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="search-icon">🔍</span>
            <input placeholder="Tìm theo tên..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👤</span>
            <span className="empty-title">Không tìm thấy người dùng</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>UUID (rút gọn)</th>
                <th>Họ tên</th>
                <th>Điểm</th>
                <th>Vé quay</th>
                <th>Quay thưởng cuối</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
                      {u.id.substring(0, 8)}...
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: "#e2e8f0" }}>{u.full_name || "—"}</td>
                  <td>
                    <span style={{ color: "#fbbf24", fontWeight: 600 }}>⭐ {u.points || 0}</span>
                  </td>
                  <td>
                    <span style={{ color: "#818cf8" }}>🎟️ {u.spin_tickets || 0}</span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {u.last_lucky_spin ? new Date(u.last_lucky_spin).toLocaleDateString("vi-VN") : "Chưa quay"}
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {u.updated_at ? new Date(u.updated_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => loadDetail(u)}>Chi tiết</button>
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

      {/* User Detail Modal */}
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">👤 {detail.full_name || "Người dùng"}</span>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Điểm", value: `⭐ ${detail.points || 0}`, color: "#fbbf24" },
                  { label: "Vé quay", value: `🎟️ ${detail.spin_tickets || 0}`, color: "#818cf8" },
                  { label: "Voucher", value: `🎁 ${detail.vouchers?.length || 0}`, color: "#34d399" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(15,17,23,0.6)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Edit points */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Cập nhật điểm thưởng</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input className="form-control" type="number" defaultValue={detail.points || 0}
                    id={`pts-${detail.id}`} />
                  <button className="btn btn-primary" style={{ whiteSpace: "nowrap" }}
                    onClick={() => {
                      const el = document.getElementById(`pts-${detail.id}`) as HTMLInputElement;
                      updatePoints(detail.id, Number(el.value));
                    }}>
                    Cập nhật
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              {detail.transactions?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>⭐ Lịch sử điểm</div>
                  {detail.transactions.map((t: any) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(99,102,241,0.08)", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>{t.reason}</span>
                      <span style={{ color: t.type === "earn" ? "#34d399" : "#f87171", fontWeight: 600 }}>
                        {t.type === "earn" ? "+" : "-"}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Vouchers */}
              {detail.vouchers?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>🎁 Voucher</div>
                  {detail.vouchers.map((v: any) => (
                    <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(15,17,23,0.5)", borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontFamily: "monospace", color: "#818cf8" }}>{v.code}</span>
                      <span style={{ color: "#34d399" }}>{v.discount_amount?.toLocaleString()}₫</span>
                      <span className={`badge ${v.status === "active" ? "badge-success" : "badge-gray"}`}>{v.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
