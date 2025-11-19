import Notification from "../models/notificationModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// --------------------------
// ADD new notification (auto populate product & user)
// --------------------------
export const addNotification = async (req, res) => {
  try {
    console.log("🔹 Request body for addNotification:", req.body);
    const { orderId, type = "alert", message } = req.body;

    if (!orderId) {
      console.warn("⚠️ addNotification: No orderId provided");
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    // Fetch order and populate user & products
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "orderItems",
        populate: { path: "product" },
      });

    if (!order) {
      console.warn("⚠️ addNotification: Order not found for ID:", orderId);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("📦 Order fetched:", order._id, "User:", order.user?._id);

    const notifications = [];

    for (const item of order.orderItems) {
      if (!item.product) continue; // safeguard
      console.log("🔹 Creating notification for product:", item.product._id);

      const notif = await Notification.create({
        userId: order.user._id,
        type,
        title: `Order #${order._id.toString().slice(-6)}`,
        message: message || `Order status updated for ${item.product.name}`,
        orderId: order._id,
        productId: item.product._id,
        read: false,
      });

      console.log("✅ Notification created in DB:", notif._id);
      notifications.push(notif);
    }

    console.log("🔔 Total notifications created:", notifications.length);

    // Emit via Socket.IO
    const io = req.app.get("io");
    if (!io) console.warn("❌ Socket.IO instance not found in req.app");

    if (io) {
      notifications.forEach((n) => {
        console.log(`📡 Emitting to userId ${n.userId} notificationId ${n._id}`);
        io.to(n.userId.toString()).emit("notification", n);
      });
      console.log("✅ All notifications emitted via Socket.IO");
    }

    res.status(201).json({ success: true, notifications });

  } catch (err) {
    console.error("❌ addNotification Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------
// MARK notification as read
// --------------------------
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log("🔹 Marking notification as read:", notificationId);

    const result = await Notification.updateOne(
      { _id: notificationId },
      { read: true }
    );

    res.status(200).json({ success: true, message: "Marked as read", result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------
// DELETE notification
// --------------------------
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log("🔹 Deleting notification:", notificationId);

    const result = await Notification.deleteOne({ _id: notificationId });

    res.status(200).json({ success: true, message: "Notification deleted", result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------
// GET notifications for a user
// --------------------------
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🔹 Fetching notifications for userId:", userId);

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    console.log(`📄 Fetched ${notifications.length} notifications for userId ${userId}`);

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("❌ getUserNotifications Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------
// CLEAR ALL notifications for a user
// --------------------------
export const clearUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🔹 Clearing all notifications for userId:", userId);

    const result = await Notification.deleteMany({ userId });
    console.log("✅ DB clearUserNotifications result:", result);

    res.status(200).json({ success: true, message: "All notifications cleared", result });
  } catch (err) {
    console.error("❌ clearUserNotifications Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
