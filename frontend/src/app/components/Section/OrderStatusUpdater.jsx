"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import ConfirmModal from "../Header/ConfirmModal";
import "./style/OrderStatusUpdater.css";

const statusOptions = ["Processing", "Shipped", "Soon", "Delivered", "Cancelled"];

const OrderStatusUpdater = ({ orderId, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleUpdateClick = () => {
    if (!status) return;
    if (status === currentStatus) return;
    if (["Delivered", "Cancelled"].includes(currentStatus)) return;

    setShowModal(true);
  };

  const confirmUpdate = async () => {
    setLoading(true);

    try {
      // 🔹 Multi-order backend compatible call
      const response = await API.put("/admin/orders", {
        orderIds: [orderId], // array me daal diya
        status,
      });

      console.log("✅ API response:", response.data);

      toast.success(`✅ Order status updated to "${status}" successfully`);
      onStatusChange && onStatusChange();
    } catch (err) {
      console.error("❌ Failed to update order:", err.response?.data || err);
      toast.error(err.response?.data?.message || "❌ Failed to update order");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const isUpdateDisabled =
    loading || status === currentStatus || ["Delivered", "Cancelled"].includes(currentStatus);

  return (
    <div className="order-status-container">
      <select
        className="status-select"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={["Delivered", "Cancelled"].includes(currentStatus)}
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button className="update-btn" onClick={handleUpdateClick} disabled={isUpdateDisabled}>
        {loading ? "Updating..." : "Update"}
      </button>

      <ConfirmModal
        show={showModal}
        message={`Are you sure you want to change status from "${currentStatus}" to "${status}"?`}
        onConfirm={confirmUpdate}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default OrderStatusUpdater;
