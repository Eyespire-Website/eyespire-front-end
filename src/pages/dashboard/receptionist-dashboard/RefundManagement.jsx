"use client"

import { useState } from "react"
import { Search, DollarSign } from "lucide-react"
import ManualRefundList from '../../../components/ManualRefundList'
import "./RefundManagement.css"

const RefundManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="refund-management">
            <div className="refund-management__header">
                <h1 className="refund-management__title">Quản lý hoàn tiền</h1>
                <div className="refund-management__search-container">
                    <div className="refund-management__search-wrapper">
                        <Search className="refund-management__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm hoàn tiền (Tên bệnh nhân, ngày hẹn, số tiền...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="refund-management__search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="refund-management__table-container">
                <div className="refund-management__table-header">
                    <div className="refund-management__table-header-content">
                        <DollarSign className="refund-management__table-header-icon" />
                        <span className="refund-management__table-header-text">
                            Danh sách hoàn tiền thủ công
                        </span>
                    </div>
                </div>

                <ManualRefundList searchQuery={searchQuery} />
            </div>
        </div>
    )
}

export default RefundManagement
