"use client";

import { useState } from "react";
import SideBar from "./Sidebar";
import Header from "../../../components/storeManagement/Header";
import OrdersPage from "./OrdersPage";
import InventoryPage from "./InventoryPage";
import ProductsPage from "./ProductsPage";
import MessagePage from "./MessagesPage";
import ProfilePage from "./ProfilePage";
import DashboardPage from "./DashboardPage";
import "./STM-Style/STM-globals.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Tổng quan" },
    { id: "orders", label: "Quản lý đơn hàng" },
    { id: "inventory", label: "Quản lý kho hàng" },
    { id: "products", label: "Đánh giá sản phẩm" },
    { id: "messages", label: "Tin nhắn" },
    { id: "profile", label: "Hồ sơ cá nhân" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardPage setActiveTab={setActiveSection} />;
      case "orders":
        return <OrdersPage />;
      case "inventory":
        return <InventoryPage />;
      case "products":
        return <ProductsPage />;
      case "messages":
        return <MessagePage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardPage setActiveTab={setActiveSection} />;
    }
  };

  const getSectionTitle = () => {
    const item = menuItems.find((item) => item.id === activeSection);
    return item ? item.label : "Tổng quan";
  };

  return (
      <div className="dashboard">
        <SideBar activeTab={activeSection} setActiveTab={setActiveSection} />
        <div className="dashboard-content">
          {activeSection !== "messages" && <Header title={getSectionTitle()} />}
          <div className="content-area">{renderContent()}</div>
        </div>
      </div>
  );
};

export default AdminDashboard;