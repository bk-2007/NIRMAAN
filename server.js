const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Attach global io instance so API routes/Server actions can trigger socket broadcasts
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
      if (roomId) {
        socket.join(`room:${roomId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined room:${roomId}`);
      }
    });

    socket.on("leave-room", (roomId) => {
      if (roomId) {
        socket.leave(`room:${roomId}`);
        console.log(`[Socket.io] Socket ${socket.id} left room:${roomId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Nirmaan Platform Ready on http://${hostname}:${port}`);
    console.log(`> Real-time Socket.io server active.`);
  });
});
