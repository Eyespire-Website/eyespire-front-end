import { useState } from "react";
import "./ProductTabs.css";

export default function ProductTabs({ description, specifications, reviews }) {
    const [activeTab, setActiveTab] = useState("description");

    const tabs = [
        { id: "description", label: "Description and Fitting guide", icon: "📋" },
        { id: "reviews", label: "Reviews", icon: "⭐" },
    ];

    return (
        <div className="product-tabs">
            <div className="tab-headers">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-header ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === "description" && (
                    <div className="description-content">
                        <div className="description-text">
                            {description.split("\n\n").map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                        <div className="fitting-guide">
                            <img
                                src="/placeholder.svg?height=200&width=300"
                                alt="Fitting Guide"
                                className="fitting-image"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="reviews-content">
                        {reviews.length === 0 ? (
                            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="review-item">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            {review.patient && review.patient.avatar ? (
                                                <img
                                                    src={review.patient.avatar}
                                                    alt={`${review.patient.name || "Unknown User"}'s avatar`}
                                                    className="reviewer-avatar"
                                                />
                                            ) : (
                                                <div
                                                    className="reviewer-avatar"
                                                    style={{
                                                        backgroundColor: "#e5e7eb",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    ?
                                                </div>
                                            )}
                                            <div>
                                                <h4>{review.patient ? review.patient.name : "Unknown User"}</h4>
                                                <div className="review-rating">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <span key={i} className={`star ${i < review.rating ? "filled" : ""}`}>
                              ★
                            </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                                    </div>
                                    <p className="review-comment">{review.comment || "No comment"}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}