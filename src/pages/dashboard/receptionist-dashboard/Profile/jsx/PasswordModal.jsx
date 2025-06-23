"use client"
import "../css/PasswordModal.css"

export default function PasswordModal({ visible, onClose, onSubmit, onChange, data, error, isSubmitting = false }) {
    if (!visible) return null

    return (
        <div className="modal-overlay-555">
            <div className="modal-content-555">
                <h2 className="modal-title">🔒 Đổi mật khẩu</h2>
                {error && <div className="error-555">{error}</div>}

                <input
                    type="password"
                    name="currentPassword"
                    placeholder="Mật khẩu hiện tại"
                    value={data.currentPassword}
                    onChange={onChange}
                    disabled={isSubmitting}
                />
                <input
                    type="password"
                    name="newPassword"
                    placeholder="Mật khẩu mới"
                    value={data.newPassword}
                    onChange={onChange}
                    disabled={isSubmitting}
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu mới"
                    value={data.confirmPassword}
                    onChange={onChange}
                    disabled={isSubmitting}
                />

                <div className="modal-actions-555">
                    <button onClick={onClose} className="btn-cancel-555" disabled={isSubmitting}>
                        Hủy
                    </button>
                    <button onClick={onSubmit} className="btn-submit-555" disabled={isSubmitting}>
                        {isSubmitting ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    )
}
