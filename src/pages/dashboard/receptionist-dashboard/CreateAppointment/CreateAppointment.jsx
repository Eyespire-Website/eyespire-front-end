import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info, Eye, Clock, MapPin, Phone, Mail, User, Calendar, CreditCard, ChevronDown, ArrowLeft } from "lucide-react";
import "./CreateAppointment.css";
import React from "react";

// Custom Components
const Card = ({ children, className = "" }) => <div className={`apt-card ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`apt-card-header ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`apt-card-content ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`apt-card-title ${className}`}>{children}</h3>;
const Label = ({ children, className = "" }) => <label className={`apt-label ${className}`}>{children}</label>;
const Input = ({ className = "", ...props }) => <input className={`apt-input ${className}`} {...props} />;
const Textarea = ({ className = "", ...props }) => <textarea className={`apt-textarea ${className}`} {...props} />;
const Button = ({ children, className = "", ...props }) => (
    <button className={`apt-button ${className}`} {...props}>{children}</button>
);
const Badge = ({ children, variant = "default", className = "" }) => {
    const variantClass = variant === "secondary" ? "apt-badge-success" : "apt-badge-error";
    return <span className={`apt-badge ${variantClass} ${className}`}>{children}</span>;
};

// Fixed Select Component
const Select = ({ children, value, onValueChange, disabled = false, defaultValue, defaultLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
    const [selectedLabel, setSelectedLabel] = useState("");

    const options = React.Children.toArray(children).find((child) => child.type === SelectContent)?.props.children || [];
    const optionsArray = React.Children.toArray(options);

    useEffect(() => {
        if (selectedValue && !selectedLabel) {
            const option = optionsArray.find((opt) => opt.props.value === selectedValue);
            if (option) {
                setSelectedLabel(option.props.children);
            } else {
                setSelectedLabel(defaultLabel || "Chọn..."); // Fallback to defaultLabel or "Chọn..."
            }
        } else if (!selectedValue && defaultLabel) {
            setSelectedLabel(defaultLabel); // Set default label when no value is selected
        }
    }, [selectedValue, optionsArray, defaultLabel]);

    const handleSelect = (val, label) => {
        setSelectedValue(val);
        setSelectedLabel(label);
        setIsOpen(false);
        if (onValueChange) onValueChange(val);
    };

    return (
        <div className={`apt-select ${isOpen ? "open" : ""}`}>
            <div
                className="apt-select-trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
            >
                <span>{selectedLabel || defaultLabel || "Chọn..."}</span>
                <ChevronDown size={16} className="apt-select-icon" />
            </div>
            {isOpen && (
                <div className="apt-select-content">
                    {optionsArray.map((option, index) => (
                        <div
                            key={index}
                            className="apt-select-item"
                            onClick={() => handleSelect(option.props.value, option.props.children)}
                        >
                            {option.props.children}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SelectTrigger = ({ children }) => children;
const SelectValue = ({ placeholder }) => null;
const SelectContent = ({ children }) => children;
const SelectItem = ({ value, children }) => null;

export default function CreateAppointment() {

    const location = useLocation();
    const navigate = useNavigate();
    const appointmentData = location.state?.appointmentData || null;
    const mode = location.state?.mode || "create";

    const [selectedDate, setSelectedDate] = useState(
        appointmentData && mode === "edit" ? Number.parseInt(appointmentData.date.split("/")[0]) : null
    );
    const [selectedTime, setSelectedTime] = useState(appointmentData && mode === "edit" ? "9:00" : "");
    const [phoneNumber, setPhoneNumber] = useState(appointmentData && mode === "edit" ? "0123456789" : "");
    const [email, setEmail] = useState(appointmentData && mode === "edit" ? "patient@example.com" : "");
    const [patientName, setPatientName] = useState(appointmentData && mode === "edit" ? "Nguyễn Văn A" : "");
    const [reason, setReason] = useState(appointmentData && mode === "edit" ? appointmentData.reason : "");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [village, setVillage] = useState("");
    const [detailedAddress, setDetailedAddress] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    const handleBackToList = () => {
        console.log("Navigating back to all-appointments");
        try {
            navigate("/dashboard/receptionist/all-appointments");
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setIsLoadingProvinces(true);
                const response = await fetch("https://provinces.open-api.vn/api/p/");
                if (!response.ok) throw new Error("Failed to fetch provinces");
                const data = await response.json();
                const formattedProvinces = data.map((province) => ({
                    code: province.code.toString(),
                    name: province.name,
                }));
                setProvinces(formattedProvinces);
            } catch (error) {
                console.error("Error fetching provinces:", error);
                setProvinces([
                    { code: "01", name: "Hà Nội" },
                    { code: "79", name: "TP. Hồ Chí Minh" },
                    { code: "48", name: "Đà Nẵng" },
                ]);
            } finally {
                setIsLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedProvince) {
                setDistricts([]);
                setWards([]);
                setSelectedDistrict("");
                setSelectedWard("");
                setVillage("");
                setDetailedAddress("");
                return;
            }
            try {
                setIsLoadingDistricts(true);
                const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
                if (!response.ok) throw new Error("Failed to fetch districts");
                const data = await response.json();
                const formattedDistricts = data.districts.map((district) => ({
                    code: district.code.toString(),
                    name: district.name,
                }));
                setDistricts(formattedDistricts);
            } catch (error) {
                console.error("Error fetching districts:", error);
                setDistricts([{ code: "001", name: "Lỗi tải dữ liệu" }]);
            } finally {
                setIsLoadingDistricts(false);
            }
        };
        fetchDistricts();
    }, [selectedProvince]);

    // Fetch wards
    useEffect(() => {
        const fetchWards = async () => {
            if (!selectedDistrict) {
                setWards([]);
                setSelectedWard("");
                setVillage("");
                setDetailedAddress("");
                return;
            }
            try {
                setIsLoadingWards(true);
                const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
                if (!response.ok) throw new Error("Failed to fetch wards");
                const data = await response.json();
                const formattedWards = data.wards.map((ward) => ({
                    code: ward.code.toString(),
                    name: ward.name,
                }));
                setWards(formattedWards);
            } catch (error) {
                console.error("Error fetching wards:", error);
                setWards([{ code: "001", name: "Lỗi tải dữ liệu" }]);
            } finally {
                setIsLoadingWards(false);
            }
        };
        fetchWards();
    }, [selectedDistrict]);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    const currentHour = today.getHours();

    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, disabled: true });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const isPast = day < currentDay;
            days.push({ day, disabled: isPast });
        }
        return days;
    };

    const generateTimeSlots = useCallback((selectedDay) => {
        const baseSlots = ["8:00", "9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        if (!selectedDay) return baseSlots;
        if (selectedDay === currentDay) {
            return baseSlots.filter((slot) => {
                const slotHour = Number.parseInt(slot.split(":")[0]);
                return slotHour > currentHour;
            });
        }
        return baseSlots;
    }, [currentDay, currentHour]);

    useEffect(() => {
        setAvailableTimeSlots(generateTimeSlots(selectedDate));
        if (selectedTime && !generateTimeSlots(selectedDate).includes(selectedTime)) {
            setSelectedTime("");
        }
    }, [selectedDate, selectedTime, generateTimeSlots]);

    const calendarDays = generateCalendarDays();

    const getDateClassName = (date) => {
        let className = "apt-date";
        if (!date.day) {
            className += " apt-date-hide";
        } else if (date.disabled) {
            className += " apt-date-off";
        } else if (selectedDate === date.day) {
            className += " apt-date-on";
        } else if (date.day === currentDay) {
            className += " apt-date-now";
        } else {
            className += " apt-date-hov";
        }
        return className;
    };

    const getTimeSlotClassName = (time) => {
        return selectedTime === time ? "apt-time apt-time-on" : "apt-time apt-time-hov";
    };

    const handleConfirmAppointment = async () => {
        if (!appointmentData?.id) {
            console.error("No appointment ID provided");
            return;
        }
        try {
            const appointment = {
                id: appointmentData.id,
                service: "Khám mắt tổng quát",
                doctor: appointmentData.doctor || "bs-nguyen-thi-lan",
                date: `${selectedDate}/${currentMonth + 1}/${currentYear}`,
                time: selectedTime,
                status: "confirmed",
                reason,
                patient: {
                    phoneNumber,
                    email,
                    patientName,
                    address: { province: selectedProvince, district: selectedDistrict, ward: selectedWard, village, detailedAddress },
                },
            };
            const response = await fetch(`/api/appointments/${appointmentData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointment),
            });
            if (!response.ok) throw new Error("Failed to confirm appointment");
            console.log("Appointment confirmed:", appointment);
            navigate("/dashboard/receptionist/all-appointments");
        } catch (error) {
            console.error("Error confirming appointment:", error);
        }
    };

    const handleCancelAppointment = async () => {
        if (!appointmentData?.id) {
            console.error("No appointment ID provided");
            return;
        }
        try {
            const response = await fetch(`/api/appointments/${appointmentData.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });
            if (!response.ok) throw new Error("Failed to cancel appointment");
            console.log("Appointment cancelled:", appointmentData.id);
            navigate("/dashboard/receptionist/all-appointments");
        } catch (error) {
            console.error("Error cancelling appointment:", error);
        }
    };

    const handleCreateAppointment = async () => {
        try {
            const appointment = {
                service: "Khám mắt tổng quát",
                doctor: "bs-nguyen-thi-lan",
                date: `${selectedDate}/${currentMonth + 1}/${currentYear}`,
                time: selectedTime,
                status: "pending",
                reason,
                patient: {
                    phoneNumber,
                    email,
                    patientName,
                    address: { province: selectedProvince, district: selectedDistrict, ward: selectedWard, village, detailedAddress },
                },
            };
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointment),
            });
            if (!response.ok) throw new Error("Failed to create appointment");
            console.log("Appointment created:", appointment);
            navigate("/dashboard/receptionist/all-appointments");
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };

    return (
        <div className="apt-wrap">
            <div className="apt-back-btn">
                <Button onClick={handleBackToList} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700">
                    <ArrowLeft size={16} />
                    Quay lại danh sách
                </Button>
            </div>
            <div className="apt-grid">
                <div className="apt-y6">
                    <Card>
                        <CardHeader className="apt-hdr-svc">
                            <CardTitle>
                                <Eye size={20} />
                                Dịch vụ khám
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="apt-form">
                                <div>
                                    <Label><span className="apt-req">*</span> Dịch vụ khám mắt</Label>
                                    <Select defaultValue="kham-tong-quat">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kham-tong-quat">Khám mắt tổng quát</SelectItem>
                                            <SelectItem value="kham-can-thi">Khám cận thị</SelectItem>
                                            <SelectItem value="kham-vien-thi">Khám viễn thị</SelectItem>
                                            <SelectItem value="kham-loan-thi">Khám loạn thị</SelectItem>
                                            <SelectItem value="kham-glaucoma">Khám glaucoma</SelectItem>
                                            <SelectItem value="kham-cataract">Khám đục thủy tinh thể</SelectItem>
                                            <SelectItem value="kham-vo-mang">Khám võng mạc</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label><span className="apt-req">*</span> Bác sĩ chuyên khoa</Label>
                                    <Select defaultValue="bs-nguyen-thi-lan">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bs-nguyen-thi-lan">BS. Nguyễn Thị Lan</SelectItem>
                                            <SelectItem value="bs-tran-van-duc">BS. Trần Văn Đức</SelectItem>
                                            <SelectItem value="bs-le-thi-mai">BS. Lê Thị Mai</SelectItem>
                                            <SelectItem value="bs-pham-minh-tuan">BS. Phạm Minh Tuấn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label><span className="apt-req">*</span> Hình thức khám</Label>
                                    <Select defaultValue="tai-phong-kham">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tai-phong-kham">Tại phòng khám</SelectItem>
                                            <SelectItem value="online">Tư vấn trực tuyến</SelectItem>
                                            <SelectItem value="tai-nha">Khám tại nhà (VIP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="apt-pay-card">
                        <CardHeader className="apt-hdr-pay">
                            <CardTitle>
                                <CreditCard size={20} />
                                Chi phí khám
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="apt-y3">
                            <div className="apt-pay-row">
                                <span className="apt-pay-lbl">Phí khám mắt:</span>
                                <span className="apt-pay-val">200.000 đ</span>
                            </div>
                            <div className="apt-pay-row">
                                <span className="apt-pay-lbl">Phí dịch vụ:</span>
                                <span className="apt-pay-val">50.000 đ</span>
                            </div>
                            <div className="apt-pay-row">
                                <span className="apt-pay-lbl">Phí di chuyển:</span>
                                <span className="apt-pay-val">0 đ</span>
                            </div>
                            <hr />
                            <div className="apt-pay-tot">
                                <span>Tổng tiền:</span>
                                <span>250.000 đ</span>
                            </div>
                            <div className="apt-pay-note">* Giá có thể thay đổi tùy theo dịch vụ</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="apt-y4">
                    <Card>
                        <CardHeader className="apt-hdr-cal">
                            <CardTitle className="apt-card-title-sm">
                                <Calendar size={16} />
                                Chọn thời gian khám
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="apt-cal-wrap">
                                <div className="apt-cal-sel apt-cal-yr">
                                    <Select value={currentYear.toString()} disabled>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="apt-cal-sel apt-cal-mon">
                                    <Select value={currentMonth.toString()} disabled>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={currentMonth.toString()}>{monthNames[currentMonth]}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="apt-cal-box">
                                <div className="apt-cal-days">
                                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                                        <div key={day} className="apt-cal-day">{day}</div>
                                    ))}
                                </div>
                                <div className="apt-cal-dates">
                                    {calendarDays.map((date, index) => (
                                        <button
                                            key={index}
                                            onClick={() => date.day && !date.disabled && setSelectedDate(date.day)}
                                            className={getDateClassName(date)}
                                            disabled={date.disabled || !date.day}
                                        >
                                            {date.day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="apt-time-lbl">
                                    <Clock size={12} />
                                    Giờ khám {selectedDate && `(${selectedDate}/${currentMonth + 1})`}
                                </Label>
                                {selectedDate ? (
                                    <div className="apt-time-grid">
                                        {availableTimeSlots.map((time) => (
                                            <button key={time} onClick={() => setSelectedTime(time)} className={getTimeSlotClassName(time)}>
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="apt-empty">
                                        <Calendar className="apt-empty-ico" />
                                        <p className="apt-empty-txt">Chọn ngày để xem giờ khám</p>
                                    </div>
                                )}
                            </div>
                            {selectedDate && selectedTime && (
                                <div className="apt-sum">
                                    <h3 className="apt-sum-ttl">Lịch hẹn:</h3>
                                    <div className="apt-sum-body">
                                        <div className="apt-sum-item">
                                            <Calendar size={12} />
                                            <span>{selectedDate}/{currentMonth + 1}/{currentYear}</span>
                                        </div>
                                        <div className="apt-sum-item">
                                            <Clock size={12} />
                                            <span>{selectedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="apt-y6">
                    <Card>
                        <CardHeader className="apt-hdr-pat">
                            <CardTitle>
                                <User size={20} />
                                {mode === "edit" ? "Thông tin bệnh nhân" : "Thông tin bệnh nhân"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="apt-y4">
                            <div className="apt-g2">
                                <div>
                                    <Label><Phone size={16} className="apt-mr-1" /><span className="apt-req">*</span> Số điện thoại</Label>
                                    <div className="apt-flex">
                                        <Input
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="apt-flex-1"
                                            placeholder="Nhập số điện thoại"
                                        />
                                        {phoneNumber && (
                                            <Badge variant={phoneNumber.length >= 10 ? "secondary" : "destructive"}>
                                                {phoneNumber.length >= 10 ? "✓" : "✕"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label><Mail size={16} className="apt-mr-1" /><span className="apt-req">*</span> Email</Label>
                                    <div className="apt-flex">
                                        <Input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="apt-flex-1"
                                            placeholder="Nhập địa chỉ email"
                                            type="email"
                                        />
                                        {email && (
                                            <Badge variant={email.includes("@") ? "secondary" : "destructive"}>
                                                {email.includes("@") ? "✓" : "✕"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="apt-g3">
                                <div>
                                    <Label><span className="apt-req">*</span> Họ và tên</Label>
                                    <Input
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                </div>
                                <div>
                                    <Label>Tuổi</Label>
                                    <Input placeholder="Tuổi" type="number" min="1" max="120" />
                                </div>
                                <div>
                                    <Label><span className="apt-req">*</span> Giới tính</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nam">Nam</SelectItem>
                                            <SelectItem value="nu">Nữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="apt-y2">
                                <Label><MapPin size={16} className="apt-mr-1" /><span className="apt-req">*</span> Địa chỉ</Label>
                                <div className="apt-g2 apt-mt-2">
                                    <div className="apt-address-field">
                                        <Label><span className="apt-req">*</span> Tỉnh/Thành phố</Label>
                                        <Select
                                            value={selectedProvince}
                                            onValueChange={(value) => {
                                                setSelectedProvince(value);
                                                setSelectedDistrict("");
                                                setSelectedWard("");
                                                setVillage("");
                                                setDetailedAddress("");
                                            }}
                                            disabled={isLoadingProvinces}
                                            defaultLabel="Tỉnh/Thành phố"
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((province) => (
                                                    <SelectItem key={province.code} value={province.code}>{province.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="apt-address-field">
                                        <Label><span className="apt-req">*</span> Quận/Huyện</Label>
                                        <Select
                                            value={selectedDistrict}
                                            onValueChange={(value) => {
                                                setSelectedDistrict(value);
                                                setSelectedWard("");
                                                setVillage("");
                                                setDetailedAddress("");
                                            }}
                                            disabled={!selectedProvince || isLoadingDistricts}
                                            defaultLabel="Quận/Huyện"
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {districts.map((district) => (
                                                    <SelectItem key={district.code} value={district.code}>{district.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="apt-g2 apt-mt-2">
                                    <div className="apt-address-field">
                                        <Label><span className="apt-req">*</span> Xã/Phường</Label>
                                        <Select
                                            value={selectedWard}
                                            onValueChange={(value) => {
                                                setSelectedWard(value);
                                                setVillage("");
                                                setDetailedAddress("");
                                            }}
                                            disabled={!selectedDistrict || isLoadingWards}
                                            defaultLabel="Xã/Phường"
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {wards.map((ward) => (
                                                    <SelectItem key={ward.code} value={ward.code}>{ward.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="apt-address-field">
                                        <Label>Thôn/Xóm</Label>
                                        <Input
                                            value={village}
                                            onChange={(e) => setVillage(e.target.value)}
                                            placeholder="Thôn/Xóm"
                                            className="apt-flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="apt-mt-2 apt-address-field">
                                    <Label>Số nhà, tên đường</Label>
                                    <Input
                                        value={detailedAddress}
                                        onChange={(e) => setDetailedAddress(e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                    />
                                </div>
                            </div>
                            <div>
                                <Label><Info size={16} className="apt-mr-1" /><span className="apt-req">*</span> Triệu chứng</Label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Mô tả triệu chứng: mờ mắt, đau mắt, khô mắt..."
                                />
                            </div>
                            <div className="apt-notes">
                                <h4 className="apt-notes-ttl"><Info size={16} />Lưu ý quan trọng:</h4>
                                <ul className="apt-notes-list">
                                    <li className="apt-notes-item"><Clock size={12} /><span>Đến sớm 15 phút trước giờ hẹn</span></li>
                                    <li className="apt-notes-item"><User size={12} /><span>Mang theo CMND/CCCD và thẻ BHYT</span></li>
                                    <li className="apt-notes-item"><Eye size={12} /><span>Không nhỏ thuốc mắt trước khi khám</span></li>
                                    <li className="apt-notes-item"><Info size={12} /><span>Thông báo nếu đang dùng thuốc gì</span></li>
                                </ul>
                            </div>
                            {mode === "edit" ? (
                                <div className="flex gap-3">
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#0656ef" }}
                                        disabled={
                                            !selectedDate ||
                                            !selectedTime ||
                                            !phoneNumber ||
                                            !email ||
                                            !patientName ||
                                            !selectedProvince ||
                                            !selectedDistrict ||
                                            !selectedWard
                                        }
                                        onClick={() => {
                                            handleConfirmAppointment();
                                            // Chuyển hướng sau khi xác nhận
                                            window.location.href = "/dashboard/receptionist/appointments"; // Thay bằng đường dẫn thực tế
                                        }}
                                    >
                                        Xác nhận cuộc hẹn
                                    </Button>
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#577cf4" }}
                                        onClick={() => {
                                            handleCancelAppointment();
                                            // Chuyển hướng sau khi hủy
                                            window.location.href = "/dashboard/receptionist/appointments"; // Thay bằng đường dẫn thực tế
                                        }}
                                    >
                                        Hủy cuộc hẹn
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="apt-button-primary"
                                    disabled={
                                        !selectedDate ||
                                        !selectedTime ||
                                        !phoneNumber ||
                                        !email ||
                                        !patientName ||
                                        !selectedProvince ||
                                        !selectedDistrict ||
                                        !selectedWard
                                    }
                                    onClick={handleCreateAppointment}
                                >
                                    Đặt lịch khám mắt
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}