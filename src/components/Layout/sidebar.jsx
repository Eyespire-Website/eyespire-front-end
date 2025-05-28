"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export default function Sidebar({ menuItems, brandName, brandColor, user, onMenuSelect }) {
    const [selectedMenu, setSelectedMenu] = useState(menuItems[0]?.id || "dashboard")

    const handleMenuClick = (item) => {
        setSelectedMenu(item.id)
        if (onMenuSelect) onMenuSelect(item.id)
        if (item.onClick) item.onClick()
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${brandColor} rounded-lg flex items-center justify-center`}>
                        <div className="w-6 h-6 bg-white rounded-full border-2 border-current"></div>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{brandName}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleMenuClick(item)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                        selectedMenu === item.id
                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">{item.badge}</span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Đăng xuất</span>
                </button>
                <div className="mt-2 text-xs text-gray-500">© 2025 {brandName}</div>
            </div>
        </div>
    )
}
