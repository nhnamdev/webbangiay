
import { useEffect, useState } from "react";
import { get } from "@/services/http";

interface Stats {
  products: number;
  brands: number;
  orders: number;
  users: number;
  coupons: number;
  news: number;
  revenue: number;
  pending: number;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "badge-warning",
    processing: "badge-info",
    shipped: "badge-purple",
    delivered: "badge-success",
    cancelled: "badge-danger",
  };
  return map[status] || "badge-gray";
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
}

const parseCustomer = (raw: any) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return null; }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [products, brands, orders, usersResp, coupons, news] = await Promise.all([
          get("/products"),
          get("/brands"),
          get("/orders"),
          get("/users", { params: { page: 1, size: 1 } }),
          get("/coupons"),
          get("/news"),
        ]);

        const revenue = (orders || [])
          .filter((o: any) => o.status === "delivered")
          .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
        const pending = (orders || []).filter((o: any) => o.status === "pending").length;

        setStats({
          products: products?.length || 0,
          brands: brands?.length || 0,
          orders: orders?.length || 0,
          users: usersResp?.total || 0,
          coupons: coupons?.length || 0,
          news: news?.length || 0,
          revenue,
          pending,
        });

        const sorted = [...(orders || [])].sort((a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setRecentOrders(sorted.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const formatCurrency = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <div className="loading-text">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Tổng quan hệ thống ZestFoot</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👟</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.products.toLocaleString()}</div>
            <div className="stat-label">Sản phẩm</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🏷️</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.brands}</div>
            <div className="stat-label">Thương hiệu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.orders.toLocaleString()}</div>
            <div className="stat-label">Đơn hàng</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👤</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.users.toLocaleString()}</div>
            <div className="stat-label">Người dùng</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">💰</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>
              {formatCurrency(stats?.revenue || 0)}
            </div>
            <div className="stat-label">Doanh thu (đã giao)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.pending}</div>
            <div className="stat-label">Đơn chờ xử lý</div>
          </div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="table-toolbar">
          <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Đơn hàng gần đây</span>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <span className="empty-title">Chưa có đơn hàng nào</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const c = parseCustomer(order.customerJson);
                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{c?.name || c?.fullName || order.email || "—"}</td>
                    <td>{formatCurrency(Number(order.totalAmount) || 0)}</td>
                    <td>{order.paymentMethod || "—"}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
