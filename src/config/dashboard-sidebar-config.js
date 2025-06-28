import {
    Calendar,
    FileText,
    History,
    User,
    Package,
    Users,
    BarChart3,
    Settings,
    Stethoscope,
    UserCheck,
    Store,
    WarehouseIcon as Inventory,
    Clock,
    MessageSquare,
    DollarSign,
} from "lucide-react"

// Menu items cho từng role
export const patientMenuItems = [
    { id: "appointments", label: "Danh sách cuộc hẹn", icon: Calendar },
    { id: "orders", label: "Theo dõi đơn hàng", icon: Package },
    { id: "medical", label: "Hồ sơ điều trị", icon: FileText },
    { id: "history", label: "Lịch sử thanh toán", icon: History },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
]

export const doctorMenuItems = [
    { id: "schedule", label: "Lịch làm việc", icon: Calendar },
    { id: "appointments", label: "Xem cuộc hẹn", icon: Clock },
    { id: "patients", label: "Hồ sơ khách hàng", icon: Users },
    { id: "create-record", label: "Tạo hồ sơ bệnh án", icon: FileText },
    { id: "feedback", label: "Xem phản hồi khách hàng", icon: MessageSquare },
    { id: "profile", label: "Tài khoản của tôi", icon: User },
]

export const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Quản lý người dùng", icon: Users },
    { id: "doctors", label: "Quản lý bác sĩ", icon: Stethoscope },
    { id: "appointments", label: "Quản lý lịch hẹn", icon: Calendar },
    { id: "orders", label: "Quản lý đơn hàng", icon: Package },
    { id: "reports", label: "Báo cáo", icon: FileText },
    { id: "settings", label: "Cài đặt hệ thống", icon: Settings },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
]

export const receptionistMenuItems = [
    { id: "appointments", label: "Đặt lịch hẹn", icon: Calendar },
    { id: "checkin", label: "Check-in bệnh nhân", icon: UserCheck },
    { id: "patients", label: "Danh sách bệnh nhân", icon: Users },
    { id: "payments", label: "Thanh toán", icon: History },
    { id: "payment-management", label: "Quản lý thanh toán", icon: DollarSign },
    { id: "schedule", label: "Lịch bác sĩ", icon: Calendar },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
]

export const storeManagerMenuItems = [
    { id: "inventory", label: "Quản lý kho", icon: Inventory },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "products", label: "Sản phẩm", icon: Store },
    { id: "suppliers", label: "Nhà cung cấp", icon: Users },
    { id: "reports", label: "Báo cáo bán hàng", icon: BarChart3 },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
]

// Brand configs cho từng role
export const brandConfigs = {
    patient: {
        name: "EyeSpire",
        color: "bg-blue-600",
    },
    doctor: {
        name: "EyeSpire Doctor",
        color: "bg-green-600",
    },
    admin: {
        name: "EyeSpire Admin",
        color: "bg-red-600",
    },
    receptionist: {
        name: "EyeSpire Reception",
        color: "bg-purple-600",
    },
    store_manager: {
        name: "EyeSpire Store",
        color: "bg-orange-600",
    },
}
