
import { useEffect, useState, useCallback } from "react";
import { get, put as putReq } from "@/services/http";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  pending:    { label: "Chờ xử lý",   badge: "badge-warning" },
  processing: { label: "Đang xử lý",  badge: "badge-info" },
  shipped:    { label: "Đang giao",    badge: "badge-purple" },
  delivered:  { label: "Đã giao",     badge: "badge-success" },
  cancelled:  { label: "Đã hủy",      badge: "badge-danger" },
};

const PAGE_SIZE = 10;

const parseJSON = (raw: any) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return null; }
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all: any[] = await get("/orders");
      let list = all;
      if (filterStatus) list = list.filter(o => o.status === filterStatus);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTotal(list.length);
      setOrders(list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await putReq(`/orders/${id}/status`, { status });
      setAlert({ type: "success", msg: "Đã cập nhật trạng thái!" });
      if (detail?.id === id) setDetail((d: any) => ({ ...d, status }));
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", msg: e?.message || "Lỗi" });
    }
    setTimeout(() => setAlert(null), 3000);
  };

  const fmt = (n: any) => Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đơn hàng</h1>
          <p className="page-subtitle">{total} đơn hàng</p>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div className="table-search">
              <span className="search-icon">🔍</span>
              <input placeholder="Tìm ID đơn hàng..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ minWidth: 160 }}
              value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <span className="empty-title">Không có đơn hàng</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(o => !search || String(o.id).includes(search))
                .map(o => {
                  const c = parseJSON(o.customerJson);
                  return (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{c?.name || c?.fullName || o.email || "—"}</td>
                      <td>{c?.phone || "—"}</td>
                      <td style={{ color: "#818cf8", fontWeight: 600 }}>{fmt(o.totalAmount)}</td>
                      <td>{o.paymentMethod || "—"}</td>
                      <td>
                        <span className={`badge ${STATUS_MAP[o.status]?.badge || "badge-gray"}`}>
                          {STATUS_MAP[o.status]?.label || o.status}
                        </span>
                      </td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => setDetail(o)}>Chi tiết</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {detail && (() => {
        const c = parseJSON(detail.customerJson);
        return (
          <div className="modal-backdrop" onClick={() => setDetail(null)}>
            <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Đơn hàng #{detail.id}</span>
                <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">Cập nhật trạng thái</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {Object.entries(STATUS_MAP).map(([k, v]) => (
                      <button key={k}
                        className={`btn btn-sm ${detail.status === k ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => updateStatus(detail.id, k)}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(15,17,23,0.5)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>📋 Thông tin khách hàng</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.85rem", color: "#94a3b8" }}>
                    <div><b style={{ color: "#cbd5e1" }}>Tên:</b> {c?.name || c?.fullName || "—"}</div>
                    <div><b style={{ color: "#cbd5e1" }}>SĐT:</b> {c?.phone || "—"}</div>
                    <div style={{ gridColumn: "1/-1" }}><b style={{ color: "#cbd5e1" }}>Địa chỉ:</b> {c?.address || detail.shippingAddress || "—"}</div>
                  </div>
                </div>

                <div style={{ background: "rgba(15,17,23,0.5)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>🛍️ Sản phẩm</div>
                  {(detail.orderItems || []).map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                      {item.product?.image && <img src={item.product.image} alt={item.product?.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 500 }}>{item.product?.name || `SP #${item.product?.id}`}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>Size: {item.size} · SL: {item.quantity}</div>
                      </div>
                      <div style={{ color: "#818cf8", fontWeight: 600 }}>{fmt((item.price || 0) * (item.quantity || 0))}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(15,17,23,0.5)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem" }}>
                    {[
                      ["Tạm tính", fmt(detail.subTotal)],
                      ["Phí ship", fmt(detail.shippingFee)],
                      ["Giảm giá", `- ${fmt(detail.discountAmount || 0)}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
                        <span>{k}</span><span style={{ color: "#cbd5e1" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", borderTop: "1px solid rgba(99,102,241,0.15)", paddingTop: 10, color: "#e2e8f0" }}>
                      <span>Tổng cộng</span>
                      <span style={{ color: "#818cf8" }}>{fmt(detail.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
