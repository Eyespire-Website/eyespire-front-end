"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Key } from "lucide-react"

export default function ProfileAvatar({ user, onAvatarChange, onPasswordChange }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-6">
                    {/* Avatar with Edit Button */}
                    <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-gray-100">
                            <AvatarImage
                                src={user.avatar || "/placeholder.svg?height=128&width=128"}
                                alt="Profile"
                                className="object-cover"
                            />
                            <AvatarFallback className="text-2xl font-semibold bg-gray-200 text-gray-600">
                                {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={onAvatarChange}
                            className="absolute bottom-1 right-1 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg border-2 border-white"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.role && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {user.role}
              </span>
                        )}
                    </div>

                    {/* Change Password Link */}
                    <button
                        onClick={onPasswordChange}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <Key className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm group-hover:text-blue-500 transition-colors">Thay đổi mật khẩu ở đây!</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
