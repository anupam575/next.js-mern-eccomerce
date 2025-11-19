import express from "express";
import {
  addNotification,
  getUserNotifications,
  deleteNotification,
  clearUserNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/add", addNotification);
router.get("/user/:userId", getUserNotifications);
router.put("/mark-read/:notificationId", markAsRead);
router.delete("/delete/:notificationId", deleteNotification);
router.delete("/clear/:userId", clearUserNotifications);

export default router;
