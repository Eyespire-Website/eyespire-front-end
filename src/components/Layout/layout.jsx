"use client"

import Sidebar from "./sidebar"

export default function Layout({ children, menuItems, brandName, brandColor, user, onMenuSelect }) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                menuItems={menuItems}
                brandName={brandName}
                brandColor={brandColor}
                user={user}
                onMenuSelect={onMenuSelect}
            />
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    )
}
