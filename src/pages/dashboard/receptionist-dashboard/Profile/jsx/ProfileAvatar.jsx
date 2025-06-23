"use client"

export default function ProfileAvatar({
                                          fullName,
                                          previewUrl,
                                          handleFileChange,
                                          handleAvatarUpload,
                                          selectedFile,
                                          isUploading = false,
                                      }) {
    return (
        <div className="avatar-wrapper">
            <div className="avatar-frame">
                {previewUrl ? (
                    <img src={previewUrl || "/placeholder.svg"} alt="Avatar" className="avatar-img" />
                ) : (
                    <span className="avatar-placeholder">{fullName.charAt(0)}</span>
                )}
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                    📷
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    disabled={isUploading}
                />
            </div>
            {selectedFile && (
                <button onClick={handleAvatarUpload} className="upload-confirm-btn" disabled={isUploading}>
                    {isUploading ? "Đang lưu..." : "Lưu ảnh"}
                </button>
            )}
        </div>
    )
}
