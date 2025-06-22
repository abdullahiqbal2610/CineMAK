// src/components/FeedbackForm.js
import React, { useState } from "react";
import { submitFeedback } from "../api/api";

const FeedbackForm = () => {
  const [customerID, setCustomerID] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await submitFeedback({ customerID, review, rating });
      alert("Feedback submitted: " + JSON.stringify(data));
      setReview("");
      setRating(5);
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Error submitting feedback.");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "20px",
      }}
    >
      <h3>Submit Feedback</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Customer ID:</label>
          <input
            type="number"
            value={customerID}
            onChange={(e) => setCustomerID(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Review:</label>
          <textarea
            placeholder="Write your review..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
            rows={3}
          />
        </div>
        <div>
          <label>Rating (1-5):</label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="1"
            max="5"
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
