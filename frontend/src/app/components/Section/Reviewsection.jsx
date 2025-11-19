"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Star, StarBorder } from "@mui/icons-material";
import {
  fetchReviews,
  fetchReviewStats,
  submitReview,
  deleteReviewById,
} from "../../../utils/reviewApi";
import ConfirmModal from "../Header/ConfirmModal";
import "./style/ReviewSection.css";

const ReviewSection = ({
  initialReviews = [],
  initialRating = 0,
  initialTotal = 0,
  onUpdateSummary,
}) => {
  const user = useSelector((state) => state.auth.user);
  const product = useSelector((state) => state.product.product);
  const productId = product?._id;

  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [totalReviews, setTotalReviews] = useState(initialTotal);
  const [breakdown, setBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const currentUserId = (user?._id || user?.id)?.toString();
  const currentUserRole = (user?.role || "").toLowerCase();

  // 🔸 Review summary update karne ka function
  const updateRatingSummary = useCallback(
    (reviewsList) => {
      if (!reviewsList) return;
      const total = reviewsList.length;
      const avg = total
        ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;
      const bd = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviewsList.forEach((r) => {
        bd[r.rating] = (bd[r.rating] || 0) + 1;
      });

      setAverageRating(avg);
      setTotalReviews(total);
      setBreakdown(bd);

      // agar parent component ne callback diya ho to update karo
      if (onUpdateSummary) onUpdateSummary(avg, total);
    },
    [onUpdateSummary]
  );

  // 🔸 Reviews fetch karne ka function
  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data } = await fetchReviews(productId);
      if (data?.success) {
        setReviews(data.reviews || []);
        updateRatingSummary(data.reviews || []);
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productId, updateRatingSummary]);

  // 🔸 Stats fetch karne ka function (average, breakdown etc.)
  const loadStats = useCallback(async () => {
    if (!productId) return;
    try {
      const { data } = await fetchReviewStats(productId);
      if (data?.success) {
        setAverageRating(data.average || 0);
        setTotalReviews(data.total || 0);
        setBreakdown(data.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      }
    } catch {
      console.error("Failed to load stats");
    }
  }, [productId]);

  // 🟢 🔸 Ek single helper function jisme dono kaam hain
  // Ye function "sab kuch load" karta hai product ke liye
  const loadAllReviewData = useCallback(async () => {
    // Yahan hum dono functions ko ek sath call kar rahe hain
    await Promise.all([loadReviews(), loadStats()]);
  }, [loadReviews, loadStats]);

  // 🟢 Ab useEffect me sirf ek helper function call kar rahe hain
  // Ye clean aur best practice hai
  useEffect(() => {
    if (!productId) return;
    loadAllReviewData();
  }, [productId, loadAllReviewData]);

  // 🔸 Review submit karne ka function
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!rating || !comment.trim()) {
        toast.warn("Please provide rating & comment");
        return;
      }
      setLoading(true);
      try {
        const { data } = await submitReview({ productId, rating, comment });
        if (data?.success) {
          toast.success("Review submitted successfully");
          setRating(0);
          setComment("");
          // Review submit hone ke baad firse sab data reload karo
          await loadAllReviewData();
        }
      } catch {
        toast.error("Failed to submit review");
      } finally {
        setLoading(false);
      }
    },
    [productId, rating, comment, loadAllReviewData]
  );

  // 🔸 Review delete karne ka function
  const handleDelete = useCallback(
    async () => {
      if (!reviewToDelete) return;
      setLoading(true);
      try {
        const { data } = await deleteReviewById({
          productId,
          reviewId: reviewToDelete,
        });
        if (data?.success) {
          toast.success("Review deleted successfully");
          // Delete ke baad bhi sab data reload kar lo
          await loadAllReviewData();
        }
      } catch {
        toast.error("Failed to delete review");
      } finally {
        setReviewToDelete(null);
        setShowConfirm(false);
        setLoading(false);
      }
    },
    [productId, reviewToDelete, loadAllReviewData]
  );

  // 🔸 Star rendering component
  const renderStars = useCallback(
    (count, interactive = false, onClick) =>
      Array.from({ length: 5 }, (_, i) => {
        const filled = i < (count || 0);
        const Icon = filled ? Star : StarBorder;
        return interactive ? (
          <button
            key={i}
            type="button"
            className={`star ${filled ? "filled" : ""}`}
            onClick={() => onClick?.(i + 1)}
          >
            <Icon />
          </button>
        ) : (
          <span key={i} className={`star ${filled ? "filled" : ""}`}>
            <Icon />
          </span>
        );
      }),
    []
  );

  if (!productId) return <p>Loading product info...</p>;

  // 🟢 Render section
  return (
    <div className="review-section">
      <h3>Customer Reviews</h3>

      {/* Summary Section */}
      <div className="rating-summary">
        <div className="average-rating">
          <Star className="big-star" /> {averageRating.toFixed(1)} out of 5
        </div>
        <div className="total-reviews">{totalReviews} reviews</div>
        <div className="breakdown">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="breakdown-row">
              <span>{star} star</span>
              <progress
                value={breakdown[star] || 0}
                max={totalReviews || 1}
              ></progress>
              <span>{breakdown[star] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="review-form">
          <label>Rating:</label>
          <div className="star-input">{renderStars(rating, true, setRating)}</div>
          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p>Please login to submit a review.</p>
      )}

      <hr />

      {/* Review List */}
      <div className="reviews-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="review-item skeleton"></div>
          ))
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((rev) => {
            const revUserId = (rev.user?._id || rev.user?.id)?.toString();
            const canDelete =
              currentUserRole === "admin" || revUserId === currentUserId;

            return (
              <div key={rev._id} className="review-item">
                <div className="review-header">
                  <strong>{rev.user?.name || "Anonymous"}</strong>
                  <div className="review-stars">{renderStars(rev.rating)}</div>
                </div>
                <p className="review-comment">{rev.comment}</p>

                {canDelete && (
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setReviewToDelete(rev._id);
                      setShowConfirm(true);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showConfirm}
        message="Are you sure you want to delete this review?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default ReviewSection;

