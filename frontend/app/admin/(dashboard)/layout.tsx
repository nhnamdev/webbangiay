
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { supabaseAdmin } from "../supabaseClient";
import "../admin.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Sản phẩm", icon: "👟" },
  { href: "/admin/brands", label: "Thương hiệu", icon: "🏷️" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "📦" },
  { href: "/admin/users", label: "Người dùng", icon: "👤" },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: "🎟️" },
  { href: "/admin/news", label: "Tin tức", icon: "📰" },
  { href: "/admin/vouchers", label: "Voucher người dùng", icon: "🎁" },
  { href: "/admin/points", label: "Điểm thưởng", icon: "⭐" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname: pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    await supabaseAdmin.auth.signOut();
    // Xóa cookie session
    document.cookie = "admin-session=; path=/; max-age=0";
    navigate("/login");
    navigate.refresh();
  };

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <style>{`body { background: #0f1117; font-family: 'Inter', sans-serif; }`}</style>
      <div className="admin-body">
        <div className="admin-wrapper">
          {/* Sidebar */}
          <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <div className="sidebar-header">
              {sidebarOpen && (
                <div className="sidebar-logo">
                  <span className="logo-icon">👟</span>
                  <span className="logo-text">ZestFoot Admin</span>
                </div>
              )}
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? "◀" : "▶"}
              </button>
            </div>

            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </Link>
              ))}
            </nav>

            <div className="sidebar-footer">
              {sidebarOpen && <span className="sidebar-version">v1.0.0</span>}
              <Link to="/" className="back-site-btn" title="Về trang chủ">
                {sidebarOpen ? "🏠 Về trang chủ" : "🏠"}
              </Link>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {isMobile && sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Main content */}
          <main className={`admin-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
            {/* Top bar */}
            <header className="admin-topbar">
              {!sidebarOpen && (
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                  ☰
                </button>
              )}
              <div className="topbar-title">
                {navItems.find((n) => isActive(n.href))?.label || "Admin Panel"}
              </div>
              <div className="topbar-right">
                <span className="admin-badge">Admin</span>
                <div className="admin-avatar">A</div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 8, color: "#f87171",
                    padding: "6px 12px", cursor: "pointer",
                    fontSize: "0.8rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </div>
            </header>

            <div className="admin-content">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
