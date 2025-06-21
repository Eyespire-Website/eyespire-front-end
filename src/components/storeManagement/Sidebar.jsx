"use client"

import {
  Package,
  UserCircle,
  LogOut,
  MessageSquare,
  ShoppingCart,
  Star,
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import "./stmStyle/STM_Sidebar.css"

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: <LayoutDashboard size={18} /> },
    { id: "orders", label: "Quản lý đơn hàng", icon: <ShoppingCart size={18} /> },
    { id: "inventory", label: "Quản lý kho hàng", icon: <Package size={18} /> },
    { id: "products", label: "Đánh giá sản phẩm", icon: <Star size={18} /> },
    { id: "messages", label: "Tin nhắn", icon: <MessageSquare size={18} /> },
    { id: "profile", label: "Hồ sơ cá nhân", icon: <UserCircle size={18} /> },
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleMenuClick = (sectionId) => {
    onSectionChange(sectionId)
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar} aria-label="Toggle sidebar">
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`sb ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sb-hdr">
          <div className="sb-logo">
            <div className="sb-logo-icon">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qT0ImjmHS7ZHxvnZ3ktrScWBE0RhcX.png"
                alt="Eyespire Logo"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            {!isCollapsed && <div className="sb-logo-txt">Eyespire</div>}
          </div>

          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {isCollapsed && (
          <button className="expand-sidebar-btn" onClick={toggleSidebar} aria-label="Expand sidebar">
            <ChevronRight size={20} />
          </button>
        )}

        <nav className="sb-nav">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`sb-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault()
                handleMenuClick(item.id)
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sb-nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="sb-nav-label">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sb-ftr">
          <a href="#" className="sb-ftr-item" title={isCollapsed ? "Đăng xuất" : undefined}>
            <LogOut size={18} />
            {!isCollapsed && <span>Đăng xuất</span>}
          </a>
          {!isCollapsed && <div className="sb-ftr-copy">© 2024 Eyespire</div>}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
