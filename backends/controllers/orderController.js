import Order from "../models/orderModel.js";
import mongoose from "mongoose"; // ES6 import
import Notification from "../models/notificationModel.js";

import Product from "../models/productModel.js";

import { calcOrderPrices } from "../utils/calcOrderPrices.js";

// ✅ Create New Order (for both COD and Payment)
export const newOrder = async (req, res, next) => {
  try {
    const { shippingInfo, orderItems, paymentInfo } = req.body;

    // Calculate accurate prices again (backend validation)
    const { itemsPrice, taxPrice, shippingFee, totalPrice } = calcOrderPrices(orderItems);

    // Prevent duplicate orders (for paymentIntent IDs)
    const existingOrder = await Order.findOne({
      "paymentInfo.id": paymentInfo.id,
      user: req.user._id,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already exists with this payment ID.",
        order: existingOrder,
      });
    }

    // Create new order
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice: shippingFee,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getSingleOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid Order ID" });
    }

    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found with this Id" });

    // Optional: restrict to owner/admin
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Single Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};






export const updateOrder = async (req, res, next) => {
  try {
    const { orderIds, status: newStatus } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "No orders provided" });
    }

    const io = req.app.get("io");
    const updatedOrders = [];
    const notifications = [];

    for (const orderId of orderIds) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        console.warn("⚠️ Invalid Order ID:", orderId);
        continue;
      }

      // 🔹 Fetch order with user and products populated
      const order = await Order.findById(orderId)
        .populate("user")
        .populate({
          path: "orderItems",
          populate: { path: "product" },
        });

      if (!order) {
        console.warn("⚠️ Order not found:", orderId);
        continue;
      }

      console.log(`🔹 Updating order ${order._id} to status "${newStatus}"`);

      // 🔹 Update stock for each product
      for (const item of order.orderItems) {
        if (!item.product) continue;
        if (["Shipped", "Delivered"].includes(newStatus)) {
          await updateStock(item.product._id, item.quantity, "decrease");
        } else if (newStatus === "Cancelled") {
          await updateStock(item.product._id, item.quantity, "increase");
        }
      }

      // 🔹 Update order status fields
      order.orderStatus = newStatus;
      if (newStatus === "Delivered") order.deliveredAt = Date.now();
      if (newStatus === "Cancelled") order.cancelledAt = Date.now();
      if (newStatus === "Soon") order.soonAt = Date.now();

      await order.save({ validateBeforeSave: false });
      updatedOrders.push(order);

      // 🔔 Amazon-style: single notification per order
      const productIds = order.orderItems
        .map(item => item.product?._id)
        .filter(Boolean); // remove null/undefined

      const productNames = order.orderItems
        .map(item => item.product?.name)
        .filter(Boolean);

      if (productIds.length > 0) {
        const notif = await Notification.create({
          userId: order.user._id,
          type: "order",
          title: `Order #${order._id.toString().slice(-6)}`,
          message: `Order status updated to "${newStatus}" for: ${productNames.join(", ")}`,
          orderId: order._id,
          productIds, // array of all products in order
          read: false,
        });

        notifications.push(notif);

        // 🔌 Emit real-time notification to user
        if (io) io.to(order.user._id.toString()).emit("notification", notif);
      }
    }

    // 🔌 Emit orderUpdated event for frontend
    if (io && updatedOrders.length > 0) {
      io.emit(
        "orderUpdated",
        updatedOrders.map(o => ({ orderId: o._id, status: o.orderStatus }))
      );
    }

    res.status(200).json({
      success: true,
      message: `${updatedOrders.length} orders updated successfully`,
      updatedOrders,
      notifications,
    });

  } catch (error) {
    console.error("❌ Update Multiple Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export async function updateStock(productId, quantity, operation = "decrease") {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  if (operation === "decrease") product.stock -= quantity;
  if (operation === "increase") product.stock += quantity;
  if (product.stock < 0) product.stock = 0;
  await product.save({ validateBeforeSave: false });
}



// Get logged in user Orders
export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// All Orders - Admin with Pagination
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name price stock")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalAmount,
      orders: orders.map((order) => ({
        _id: order._id,
        user: order.user,
        orderItems: order.orderItems.map((item) => ({
          product: item.product?._id || null,
          name: item.product?.name || "Deleted Product",
          price: item.product?.price || 0,
          quantity: item.quantity,
          currentStock: item.product?.stock ?? 0,
        })),
        shippingInfo: order.shippingInfo,
        paymentInfo: order.paymentInfo,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const deleteOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid Order ID" });
    }

    // 2️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found with this Id" });
    }

    // 3️⃣ Optional: Check if req.user is admin or owner
    // if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Not authorized to delete this order" });
    // }

    // 4️⃣ Delete order
    await order.deleteOne();

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
