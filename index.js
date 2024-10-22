const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins; adjust as necessary
    methods: ["GET", "POST"],
  },
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO logic
const usersInRoom = {};
const usernames = {};

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    usernames[socket.id] = username;
    usersInRoom[room] = (usersInRoom[room] || 0) + 1;

    io.to(room).emit("message", {
      message: `${username} has joined the room.`,
      username: "System",
      time: new Date().toLocaleTimeString(),
    });
    io.to(room).emit("userCount", usersInRoom[room]);
  });

  socket.on("chatMessage", (msg) => {
    const { room, message } = msg;
    const username = usernames[socket.id];
    io.to(room).emit("message", {
      message,
      username,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("disconnect", () => {
    const rooms = Object.keys(socket.rooms);
    rooms.forEach((room) => {
      if (usersInRoom[room]) {
        usersInRoom[room]--;
        const username = usernames[socket.id];
        io.to(room).emit("message", {
          message: `${username} has left the room.`,
          username: "System",
          time: new Date().toLocaleTimeString(),
        });
        io.to(room).emit("userCount", usersInRoom[room]);
        if (usersInRoom[room] === 0) delete usersInRoom[room];
      }
    });
    delete usernames[socket.id];
    console.log("User disconnected: " + socket.id);
  });
});

// Start the server only in local development
if (process.env.NODE_ENV !== "production") {
  server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
  });
}

// Export the server for Vercel
module.exports = (req, res) => {
  return new Promise((resolve) => {
    server.emit("request", req, res);
    resolve();
  });
};
