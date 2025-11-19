import app from "./app.js";
import cloudinary from "cloudinary";
import connectDatabase from "./config/database.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config({ path: "./config/config.env" });

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    console.log("🔹 Starting server...");

    // Connect to MongoDB
    await connectDatabase();
    console.log("✅ Database connected");

    // Configure Cloudinary
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("☁️ Cloudinary configured");

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    // Attach io globally to app
    app.set("io", io);
    console.log("🔌 Socket.IO initialized and attached to app");

    // Handle socket connections
    io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Listen for join events
      socket.on("join", (userId) => {
        console.log(`📌 Received join request for userId: ${userId}`);
        if (!userId) {
          console.warn("⚠️ join event received without userId");
          return;
        }
        socket.join(userId);
        console.log(`✅ User joined room: ${userId}`);
        socket.emit("joined", { userId, socketId: socket.id }); // ack
      });

      // Listen for disconnect
      socket.on("disconnect", (reason) => {
        console.log(`❌ Client disconnected: ${socket.id}. Reason: ${reason}`);
      });
    });

    // Start server
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌐 Allowed Frontend: ${process.env.FRONTEND_URL}`);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      console.error(err.stack);
      server.close(() => process.exit(1));
    });

    // Extra: Log connected sockets every 15 seconds
    setInterval(() => {
      console.log(`ℹ️ Connected sockets: ${io.sockets.sockets.size}`);
    }, 15000);

  } catch (err) {
    console.error(`❌ Startup Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
};

startServer();
