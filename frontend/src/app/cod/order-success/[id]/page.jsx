"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import "./success.css";

const OrderSuccessPage = () => {
  const router = useRouter();
  const { id } = useParams();

  // Redirect to home if no id found
  useEffect(() => {
    if (!id) {
      router.push("/");
    }
  }, [id, router]);

  return (
    <div className="success-container">
      <h2 className="success-title">✅ Order Placed Successfully!</h2>

      {id ? (
        <>
          <p className="order-id">
            Your order ID: <strong>{id}</strong>
          </p>

          <button
            className="order-detail-btn"
            onClick={() => router.push(`/my-orders/${id}`)}
          >
            View Order Full Details
          </button>
        </>
      ) : (
        <p className="error-text">Order ID not found. Redirecting...</p>
      )}

      <button className="back-home-btn" onClick={() => router.push("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default OrderSuccessPage;
