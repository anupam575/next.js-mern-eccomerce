"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  addLocalNotification,
  deleteNotificationAPI,
  clearAllNotificationsAPI,
  markReadAPI,
} from "@/redux/slices/notificationSlice";

import {
  Notifications,
  LocalShipping,
  Warning,
  LocalOffer,
  Inventory2,
  Delete,
  ClearAll,
} from "@mui/icons-material";

import socket from "@/utils/socket";
import "./Notifications.css";

// --------------------------
// NotificationsPage Component
// --------------------------
function NotificationsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { list: notifications, loading, error } = useSelector(
    (s) => s.notifications
  );

  const userId = user?._id || user?.id;

  // Fetch notifications on mount
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchNotifications(userId));
  }, [userId, dispatch]);

  // Socket listener
  useEffect(() => {
    if (!userId) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", userId);

    const handleNotification = (n) => dispatch(addLocalNotification(n));
    socket.on("notification", handleNotification);

    return () => socket.off("notification", handleNotification);
  }, [userId, dispatch]);

  const formatDate = (t) => new Date(t).toLocaleString();

  const getSection = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
      return "Today";

    const diff = (today - date) / (1000 * 60 * 60 * 24);
    if (diff <= 7) return "This Week";

    return "Earlier";
  };

  const icons = {
    order: <Inventory2 className="icon order" />,
    delivery: <LocalShipping className="icon delivery" />,
    alert: <Warning className="icon alert" />,
    promo: <LocalOffer className="icon promo" />,
    default: <Notifications className="icon default" />,
  };

  const grouped = { Today: [], "This Week": [], Earlier: [] };
  notifications.forEach((n) => grouped[getSection(n.createdAt)].push(n));

  const handleDelete = (id) => dispatch(deleteNotificationAPI(id));
  const handleClearAll = () => dispatch(clearAllNotificationsAPI(userId));
  const handleMarkRead = (id) => dispatch(markReadAPI(id));

  if (loading) return <p className="loading">Loading notifications...</p>;
  if (!loading && notifications.length === 0)
    return <p className="empty">No notifications found.</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h1>Notifications</h1>
        <button
          className="clear-btn"
          onClick={handleClearAll}
          disabled={notifications.length === 0}
          title={
            notifications.length === 0
              ? "No notifications to clear"
              : "Clear all notifications"
          }
        >
          <ClearAll /> Clear All
        </button>
      </div>

      {["Today", "This Week", "Earlier"].map(
        (sec) =>
          grouped[sec].length > 0 && (
            <div key={sec} className="section">
              <h2 className="section-title">{sec}</h2>
              {grouped[sec].map((n) => (
                <div
                  key={n._id}
                  className={`card ${n.read ? "read" : ""}`}
                  onClick={() => handleMarkRead(n._id)}
                >
                  <div className="left">{icons[n.type] || icons.default}</div>
                  <div className="center">
                    <p className="type">{n.type}</p>
                    <p className="msg">{n.message}</p>
                    <p className="time">{formatDate(n.createdAt)}</p>
                  </div>
                  <div className="right">
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n._id);
                      }}
                    >
                      <Delete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}

// --------------------------
// Export at the bottom
// --------------------------
export default NotificationsPage;
