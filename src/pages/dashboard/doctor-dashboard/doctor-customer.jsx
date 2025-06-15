"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./doctor-customer.css"
import { Search, Eye, Edit, Save, User, Phone, Mail, Calendar, Plus } from "lucide-react"

export default function CustomerProfile() {
    const [activeSection, setActiveSection] = useState("info")
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [editMode, setEditMode] = useState(false)
    const [editedCustomer, setEditedCustomer] = useState(null)

    // Fetch customers on component mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true)
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Sample data
                const sampleCustomers = [
                    {
                        id: 1,
                        name: "Đỗ Văn Dũng",
                        phone: "0352195878",
                        email: "dvdung@gmail.com",
                        gender: "Nam",
                        address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
                        registeredDate: "15/06/2023",
                        appointments: [
                            {
                                id: 101,
                                date: "23/11/2024",
                                time: "8:00",
                                service: "Xét nghiệm ký sinh trùng",
                                status: "completed",
                                notes: "Phát hiện ký sinh trùng, đã điều trị",
                            },
                            {
                                id: 102,
                                date: "15/10/2024",
                                time: "14:30",
                                service: "Khám tổng quát",
                                status: "completed",
                                notes: "Cá khỏe mạnh, không phát hiện vấn đề",
                            },
                        ],
                        healthRecords: [
                            {
                                id: 201,
                                date: "23/11/2024",
                                diagnosis: "Nhiễm ký sinh trùng Ichthyophthirius",
                                treatment: "Thuốc API Super Ich Cure, 5ml/10L nước",
                                notes: "Cần theo dõi trong 1 tuần, thay nước 30% mỗi 2 ngày",
                            },
                            {
                                id: 202,
                                date: "10/09/2024",
                                diagnosis: "Viêm mang nhẹ",
                                treatment: "Thuốc API Melafix, 10ml/20L nước",
                                notes: "Đã khỏi sau 5 ngày điều trị",
                            },
                        ],
                    },
                    {
                        id: 2,
                        name: "Nguyễn Thị Hoa",
                        phone: "0987654321",
                        email: "hoa.nguyen@gmail.com",
                        gender: "Nữ",
                        address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
                        registeredDate: "20/07/2023",
                        appointments: [
                            {
                                id: 103,
                                date: "24/11/2024",
                                time: "9:30",
                                service: "Khám tổng quát",
                                status: "confirmed",
                                notes: "Kiểm tra định kỳ",
                            },
                        ],
                        healthRecords: [
                            {
                                id: 203,
                                date: "15/08/2024",
                                diagnosis: "Khỏe mạnh",
                                treatment: "Không cần điều trị",
                                notes: "Tiếp tục chế độ dinh dưỡng hiện tại",
                            },
                        ],
                    },
                    {
                        id: 3,
                        name: "Trần Văn Minh",
                        phone: "0123456789",
                        email: "minhtran@gmail.com",
                        gender: "Nam",
                        address: "789 Đường Võ Văn Tần, Quận 10, TP.HCM",
                        registeredDate: "05/03/2024",
                        appointments: [
                            {
                                id: 104,
                                date: "25/11/2024",
                                time: "14:00",
                                service: "Điều trị bệnh da",
                                status: "confirmed",
                                notes: "Cá có vết loét trên da, cần điều trị",
                            },
                        ],
                        healthRecords: [
                            {
                                id: 204,
                                date: "20/10/2024",
                                diagnosis: "Bệnh nấm da",
                                treatment: "Thuốc API Fungus Cure, 5ml/10L nước",
                                notes: "Cần theo dõi trong 2 tuần",
                            },
                        ],
                    },
                ]

                setCustomers(sampleCustomers)

                // If ID is provided, select that customer
                if (id) {
                    const customer = sampleCustomers.find((c) => c.id === Number.parseInt(id))
                    if (customer) {
                        setSelectedCustomer(customer)
                        setEditedCustomer({ ...customer })
                    }
                } else if (sampleCustomers.length > 0) {
                    // Otherwise select the first customer
                    setSelectedCustomer(sampleCustomers[0])
                    setEditedCustomer({ ...sampleCustomers[0] })
                }
            } catch (error) {
                console.error("Error fetching customers:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [id])

    const handleBackHome = () => {
        navigate("/")
    }

    const selectCustomer = (customer) => {
        setSelectedCustomer(customer)
        setEditedCustomer({ ...customer })
        setEditMode(false)
    }

    const handleEditToggle = () => {
        if (editMode) {
            // Save changes
            setSelectedCustomer({ ...editedCustomer })
            setCustomers((prev) => prev.map((c) => (c.id === editedCustomer.id ? { ...editedCustomer } : c)))
        }
        setEditMode(!editMode)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditedCustomer((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "confirmed":
                return <span className="status-badge confirmed">Đã xác nhận</span>
            case "pending":
                return <span className="status-badge pending">Chờ xác nhận</span>
            case "completed":
                return <span className="status-badge completed">Hoàn thành</span>
            default:
                return <span className="status-badge pending">Chờ xác nhận</span>
        }
    }

    return (
        <div className="customer-container">
            {/* Main Content */}
            <div className="customer-content">
                <header className="customer-header">
                    <h1>Hồ sơ bệnh nhân</h1>
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bệnh nhân (Tên, SĐT, Email...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </header>

                <div className="customer-profile-container">
                    {/* Customer List */}
                    <div className="customer-list-container">
                        <div className="customer-list-header">
                            <h2>Danh sách bệnh nhân</h2>
                        </div>

                        <div className="customer-list">
                            {loading ? (
                                <div className="loading-message">Đang tải dữ liệu...</div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="empty-message">Không tìm thấy bệnh nhân</div>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className={`customer-list-item ${selectedCustomer?.id === customer.id ? "active" : ""}`}
                                        onClick={() => selectCustomer(customer)}
                                    >
                                        <div className="customer-avatar">
                                            <User size={24} />
                                        </div>
                                        <div className="customer-list-info">
                                            <h3>{customer.name}</h3>
                                            <div className="customer-list-details">
                                                <span>
                                                    <Phone size={14} />
                                                    {customer.phone}
                                                </span>
                                                <span>
                                                    <Mail size={14} />
                                                    {customer.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Customer Details */}
                    {selectedCustomer ? (
                        <div className="customer-details-container">
                            <div className="customer-details-header">
                                <div className="customer-details-actions">
                                    <button className={`action-btn ${editMode ? "save-btn" : "edit-btn"}`} onClick={handleEditToggle}>
                                        {editMode ? (
                                            <>
                                                <Save size={16} />
                                                Lưu
                                            </>
                                        ) : (
                                            <>
                                                <Edit size={16} />
                                                Chỉnh sửa
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="customer-details-tabs">
                                <button
                                    className={`tab-btn ${activeSection === "info" ? "active" : ""}`}
                                    onClick={() => setActiveSection("info")}
                                >
                                    Thông tin cá nhân
                                </button>
                                <button
                                    className={`tab-btn ${activeSection === "appointments" ? "active" : ""}`}
                                    onClick={() => setActiveSection("appointments")}
                                >
                                    Lịch sử cuộc hẹn ({selectedCustomer.appointments.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeSection === "health" ? "active" : ""}`}
                                    onClick={() => setActiveSection("health")}
                                >
                                    Hồ sơ bệnh án ({selectedCustomer.healthRecords.length})
                                </button>
                            </div>

                            <div className="customer-details-content">
                                {/* Personal Information */}
                                {activeSection === "info" && (
                                    <div className="customer-info-section">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Họ và tên:</label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editedCustomer.name}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span>{selectedCustomer.name}</span>
                                                )}
                                            </div>

                                            <div className="info-item">
                                                <label>Giới tính:</label>
                                                {editMode ? (
                                                    <select
                                                        name="gender"
                                                        value={editedCustomer.gender}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    >
                                                        <option value="Nam">Nam</option>
                                                        <option value="Nữ">Nữ</option>
                                                        <option value="Khác">Khác</option>
                                                    </select>
                                                ) : (
                                                    <span>{selectedCustomer.gender}</span>
                                                )}
                                            </div>

                                            <div className="info-item">
                                                <label>Số điện thoại:</label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={editedCustomer.phone}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span>{selectedCustomer.phone}</span>
                                                )}
                                            </div>

                                            <div className="info-item">
                                                <label>Email:</label>
                                                {editMode ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editedCustomer.email}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span>{selectedCustomer.email}</span>
                                                )}
                                            </div>

                                            <div className="info-item full-width">
                                                <label>Địa chỉ:</label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={editedCustomer.address}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span>{selectedCustomer.address}</span>
                                                )}
                                            </div>

                                            <div className="info-item">
                                                <label>Ngày đăng ký:</label>
                                                <span>{selectedCustomer.registeredDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Appointment History */}
                                {activeSection === "appointments" && (
                                    <div className="appointment-history-section">
                                        <div className="section-header">
                                            <h3>Lịch sử cuộc hẹn</h3>
                                            <button className="add-btn">
                                                <Plus size={16} />
                                                Tạo cuộc hẹn mới
                                            </button>
                                        </div>

                                        <div className="appointment-list">
                                            {selectedCustomer.appointments.length === 0 ? (
                                                <div className="empty-message">Chưa có cuộc hẹn nào</div>
                                            ) : (
                                                <table className="appointment-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Ngày</th>
                                                        <th>Giờ</th>
                                                        <th>Dịch vụ</th>
                                                        <th>Trạng thái</th>
                                                        <th>Ghi chú</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {selectedCustomer.appointments.map((appointment) => (
                                                        <tr key={appointment.id}>
                                                            <td>{appointment.date}</td>
                                                            <td>{appointment.time}</td>
                                                            <td>{appointment.service}</td>
                                                            <td>{getStatusBadge(appointment.status)}</td>
                                                            <td className="notes-cell">{appointment.notes}</td>
                                                            <td>
                                                                <div className="table-actions">
                                                                    <button className="table-action-btn">
                                                                        <Eye size={14} />
                                                                    </button>
                                                                    <button className="table-action-btn">
                                                                        <Edit size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Health Records */}
                                {activeSection === "health" && (
                                    <div className="health-records-section">
                                        <div className="section-header">
                                            <h3>Hồ sơ bệnh án</h3>
                                            <button className="add-btn">
                                                <Plus size={16} />
                                                Thêm hồ sơ mới
                                            </button>
                                        </div>

                                        <div className="health-records-list">
                                            {selectedCustomer.healthRecords.length === 0 ? (
                                                <div className="empty-message">Chưa có hồ sơ bệnh án</div>
                                            ) : (
                                                selectedCustomer.healthRecords.map((record) => {
                                                    return (
                                                        <div key={record.id} className="health-record-card">
                                                            <div className="health-record-header">
                                                                <div className="health-record-date">
                                                                    <Calendar size={16} />
                                                                    <span>{record.date}</span>
                                                                </div>
                                                            </div>
                                                            <div className="health-record-body">
                                                                <div className="health-record-item">
                                                                    <label>Chẩn đoán:</label>
                                                                    <span>{record.diagnosis}</span>
                                                                </div>
                                                                <div className="health-record-item">
                                                                    <label>Điều trị:</label>
                                                                    <span>{record.treatment}</span>
                                                                </div>
                                                                <div className="health-record-item">
                                                                    <label>Ghi chú:</label>
                                                                    <span>{record.notes}</span>
                                                                </div>
                                                            </div>
                                                            <div className="health-record-footer">
                                                                <button className="health-record-btn">
                                                                    <Edit size={14} />
                                                                    Chỉnh sửa
                                                                </button>
                                                                <button className="health-record-btn view">
                                                                    <Eye size={14} />
                                                                    Xem chi tiết
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-customer-selected">
                            <div className="no-selection-message">
                                <User size={48} />
                                <h3>Chọn bệnh nhân để xem thông tin chi tiết</h3>
                                <p>Hoặc thêm bệnh nhân mới bằng nút "Thêm bệnh nhân"</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
