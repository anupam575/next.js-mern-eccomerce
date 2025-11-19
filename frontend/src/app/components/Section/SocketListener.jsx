"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "@/utils/socket";
import { addLocalNotification } from "@/redux/slices/notificationSlice";

export default function SocketListener() {
  const dispatch = useDispatch();

  // CURRENT USER
  const currentUser = useSelector((state) => state.auth.user);

  // ✅ Support both id and _id
  const userId = currentUser?.id || currentUser?._id;

  console.log("🟩 SocketListener Mounted — User:", userId);

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No userId — socket won't join any room");
      return;
    }

    // 🔌 Ensure socket is connected
    if (!socket.connected) {
      console.log("🔌 Connecting socket…");
      socket.connect();
    } else {
      console.log("🟢 Socket already connected:", socket.id);
    }

    // 🟦 JOIN ROOM
    const joinUserRoom = () => {
      console.log(`📨 Joining Room: ${userId}`);
      socket.emit("join", userId, (ack) => {
        console.log("📨 Join ACK:", ack || "No response");
      });
    };

    if (socket.connected) {
      joinUserRoom();
    } else {
      socket.once("connect", () => {
        console.log("🟢 Socket connected — now joining room");
        joinUserRoom();
      });
    }

    // 🔥 Normalize function for all notifications
    const normalize = (data) => ({
      ...data,

      // Always force string IDs, fallback to current userId if missing
      _id: String(data?._id?.$oid || data?._id || ""),
      userId: String(data?.userId?.$oid || data?.userId || userId || ""),
      orderId: data?.orderId?.$oid || data?.orderId || "",
      productId: data?.productId?.$oid || data?.productId || "",
      read: data.read || false,

      // Clean Dates
      createdAt: data?.createdAt?.$date?.$numberLong
        ? new Date(Number(data.createdAt.$date.$numberLong))
        : new Date(data.createdAt),
      updatedAt: data?.updatedAt?.$date?.$numberLong
        ? new Date(Number(data.updatedAt.$date.$numberLong))
        : new Date(data.updatedAt),
    });

    // 🔔 Handle notification event
    const handleNotification = (raw) => {
      console.log("📥 RAW Notification:", raw);

      if (!raw) return console.warn("⚠ No data received!");

      const parsed = normalize(raw);

      console.log("✅ Normalized Notification:", parsed);

      dispatch(addLocalNotification(parsed));
    };

    socket.on("notification", handleNotification);

    // Debug all events
    socket.onAny((event, ...args) => {
      console.log(`⚡ Event: ${event}`, args);
    });

    // Connection Logs
    socket.on("connect", () => console.log("🟢 SOCKET CONNECTED:", socket.id));
    socket.on("disconnect", (reason) =>
      console.warn("🔴 SOCKET DISCONNECTED:", reason)
    );

    // Cleanup when component unmounts
    return () => {
      console.log("♻️ Cleaning Socket Listeners");
      socket.off("notification", handleNotification);
      socket.off("connect");
      socket.off("disconnect");
      socket.offAny();
    };
  }, [userId, dispatch]);

  return null;
}
