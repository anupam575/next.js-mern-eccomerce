"use client"; // Required because it uses event handlers (onClick)

import React from "react";
import "./modal.css"; // Keep this relative path or move under /styles if needed

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button
            className="modal-btn confirm-btn"
            onClick={onConfirm}
            type="button"
          >
            Yes
          </button>
          <button
            className="modal-btn cancel-btn"
            onClick={onCancel}
            type="button"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
