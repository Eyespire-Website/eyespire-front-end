import React, { useState } from "react"
import { Stethoscope, Users, Calendar, Package, UserCircle, LogOut, Home, Clock as ClockIcon, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import "./styles/index.css"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../../dashboard/admin-dashboard/Sidebar-ad/Sidebar-admin"

import { Separator } from "./ui/separator"

// Importar correctamente los componentes de contenido desde el subdirectorio "pages"
import DashboardContent from "./pages/DashboardContent"
import InventoryContent from "./pages/InventoryContent"
import ProfileContent from "./pages/ProfileContent"
import StaffContent from "./pages/StaffContent"
import ServicesContent from "./pages/ServicesContent"
import ScheduleContent from "./pages/ScheduleContent"
import AppointmentsContent from "./pages/AppointmentsContent"
import UsersContent from "./pages/UsersContent"

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Organized menu items by category
  const mainMenuItems = [
    { id: "dashboard", label: "Tổng quan", icon: <Home size={18} /> },
    { id: "appointments", label: "Cuộc hẹn", icon: <Calendar size={18} /> },
    { id: "schedule", label: "Lịch làm việc", icon: <ClockIcon size={18} /> },
  ]

  const managementItems = [
    { id: "users", label: "Người dùng", icon: <Users size={18} /> },
    { id: "staff", label: "Nhân viên", icon: <UserCircle size={18} /> },
    { id: "services", label: "Dịch vụ", icon: <Stethoscope size={18} /> },
    { id: "inventory", label: "Kho hàng", icon: <Package size={18} /> },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />
      case "inventory":
        return <InventoryContent />
      case "profile":
        return <ProfileContent />
      case "staff":
        return <StaffContent />
      case "services":
        return <ServicesContent />
      case "schedule":
        return <ScheduleContent />
      case "appointments":
        return <AppointmentsContent />
      case "users":
        return (
          <UsersContent
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            showCustomerModal={showCustomerModal}
            setShowCustomerModal={setShowCustomerModal}
          />
        )
      default:
        return <DashboardContent />
    }
  }

  const getSectionTitle = () => {
    const allItems = [...mainMenuItems, ...managementItems]
    const item = allItems.find((item) => item.id === activeSection)
    if (activeSection === "profile") return "Hồ sơ cá nhân"
    return item ? item.label : "Tổng quan"
  }

  return (
    <div className="dashboard-container">
      <Sidebar variant="inset" className={isSidebarOpen ? 'open' : ''}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                    alt="Eyespire Logo"
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Eyespire - </span>
                  <span className="truncate">Admin Dashboard</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Chính</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Management */}
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* User Account */}
          <SidebarGroup>
            <SidebarGroupLabel>Tài khoản</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeSection === "profile"}
                    onClick={() => setActiveSection("profile")}
                  >
                    <UserCircle size={18} />
                    <span>Hồ sơ cá nhân</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">{getSectionTitle()}</h1>
        </header>

        <div className="content-wrapper" style={{ paddingTop: '24px' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard