"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfileForm({ user, onSave, fields = [] }) {
    const [formData, setFormData] = useState(user || {})

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = () => {
        if (onSave) onSave(formData)
    }

    const defaultFields = [
        { id: "email", label: "Email", type: "email", readOnly: true },
        { id: "phone", label: "Số điện thoại", type: "phone", required: true },
        {
            id: "gender",
            label: "Giới tính",
            type: "select",
            required: true,
            options: [
                { value: "MALE", label: "Nam" },
                { value: "FEMALE", label: "Nữ" },
                { value: "OTHER", label: "Khác" },
            ],
        },
        { id: "username", label: "Tên tài khoản", type: "text", required: true },
        { id: "fullname", label: "Họ và tên", type: "text", required: true },
        { id: "address", label: "Địa chỉ", type: "text", span: 2 },
    ]

    const fieldsToRender = fields.length > 0 ? fields : defaultFields

    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fieldsToRender.map((field) => (
                        <div key={field.id} className={`space-y-2 ${field.span === 2 ? "md:col-span-2" : ""}`}>
                            <Label htmlFor={field.id}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {field.type === "select" ? (
                                <Select value={formData[field.id] || ""} onValueChange={(value) => handleInputChange(field.id, value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : field.type === "phone" ? (
                                <div className="flex">
                                    <div className="flex items-center px-3 bg-red-600 text-white rounded-l-md">
                                        <span className="text-sm font-medium">+84</span>
                                    </div>
                                    <Input
                                        id={field.id}
                                        value={formData[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="rounded-l-none"
                                    />
                                </div>
                            ) : (
                                <Input
                                    id={field.id}
                                    type={field.type}
                                    value={formData[field.id] || ""}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className={field.readOnly ? "bg-gray-50" : ""}
                                    readOnly={field.readOnly}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-8">
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                        Cập nhật
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
