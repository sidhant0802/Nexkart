const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");

let io = null;

// ✅ Initialize Socket.IO
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      "*",
      methods:     ["GET", "POST"],
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // ✅ Auth middleware — verify JWT on connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
                 || socket.handshake.query?.token;

      if (!token) {
        // Allow anonymous connections (just won't get personal events)
        socket.userId = null;
        socket.userType = "anonymous";
        return next();
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      socket.userId   = decoded.email || decoded.userId;
      socket.email    = decoded.email;
      socket.userType = decoded.role || "customer";
      next();
    } catch (err) {
      socket.userId = null;
      next();   // still allow connection
    }
  });

  // ✅ Connection handler
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id} (${socket.email || "anonymous"})`);

    // ── Auto-join rooms based on user type ──
    if (socket.email) {
      socket.join(`user:${socket.email}`);
    }

    // ── Listen for room subscriptions from client ──
    socket.on("join:admin", () => {
      socket.join("admin");
      console.log(`👑 ${socket.id} joined admin room`);
    });

    socket.on("join:seller", (sellerId) => {
      socket.join(`seller:${sellerId}`);
      console.log(`🏪 ${socket.id} joined seller room: ${sellerId}`);
    });

    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on("join:order", (orderId) => {
      socket.join(`order:${orderId}`);
    });

    // ── Disconnect ──
    socket.on("disconnect", () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
};

// ✅ Get io instance (use this in controllers/workers)
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call initSocket() first.");
  }
  return io;
};

// ✅ Helper functions to emit events
const emitToAdmin = (event, data) => {
  if (!io) return;
  io.to("admin").emit(event, data);
  console.log(`📢 [admin] ← ${event}`);
};

const emitToSeller = (sellerId, event, data) => {
  if (!io) return;
  io.to(`seller:${sellerId}`).emit(event, data);
  console.log(`📢 [seller:${sellerId}] ← ${event}`);
};

const emitToUser = (userIdOrEmail, event, data) => {
  if (!io) return;
  io.to(`user:${userIdOrEmail}`).emit(event, data);
  console.log(`📢 [user:${userIdOrEmail}] ← ${event}`);
};

const emitToOrder = (orderId, event, data) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit(event, data);
};

const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

// ✅ Get connection stats (for admin dashboard)
const getStats = () => {
  if (!io) return { connected: 0, rooms: 0 };
  return {
    connected: io.engine.clientsCount,
    rooms:     io.sockets.adapter.rooms.size,
  };
};

module.exports = {
  initSocket,
  getIO,
  emitToAdmin,
  emitToSeller,
  emitToUser,
  emitToOrder,
  emitToAll,
  getStats,
};