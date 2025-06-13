"use client"

import { useState } from "react"
import "./ProductTabs.css"

export default function ProductTabs({ description, specifications, reviews }) {
  const [activeTab, setActiveTab] = useState("description")

  const tabs = [
    { id: "description", label: "Description and Fitting guide", icon: "📋" },
    { id: "specifications", label: "Additional Information", icon: "ℹ️" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
  ]

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? "filled" : ""}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="product-tabs">
      {/* Tab Headers */}
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

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "description" && (
          <div className="description-content">
            <div className="description-text">
              {description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="fitting-guide">
              <img src="/placeholder.svg?height=200&width=300" alt="Fitting Guide" className="fitting-image" />
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="specifications-content">
            <table className="specs-table">
              <tbody>
                {Object.entries(specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="spec-label">{key}</td>
                    <td className="spec-value">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-content">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <h4>{review.author}</h4>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  </div>
                  <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
