import React from "react";

export default function ProfileAvatar({ fullName, previewUrl, handleFileChange, handleAvatarUpload, selectedFile }) {
    return (
        <div className="avatar-wrapper">
            <div className="avatar-frame">
                {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="avatar-img" />
                ) : (
                    <span className="avatar-placeholder">{fullName.charAt(0)}</span>
                )}
                <label htmlFor="avatar-upload" className="avatar-upload-btn">📷</label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </div>
            {selectedFile && (
                <button onClick={handleAvatarUpload} className="upload-confirm-btn">Lưu ảnh</button>
            )}
        </div>
    );
}
