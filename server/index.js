const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with client URL
    methods: ["GET", "POST"]
  }
});

// Simple in-memory store
// rooms[roomId] = { users: [], history: [] }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], history: [] };
    }
    
    // Add user
    rooms[roomId].users.push({ id: socket.id, username });
    
    // Send history to new user
    socket.emit('load-history', rooms[roomId].history);
    
    // Notify others
    io.to(roomId).emit('user-joined', { 
      id: socket.id, 
      username, 
      users: rooms[roomId].users 
    });
    
    console.log(`${username} joined room ${roomId}`);
  });

  socket.on('draw', ({ roomId, data }) => {
    // data: { x, y, color, size, type (start, end, path) }
    // We store drawing events to replay history
    if (rooms[roomId]) {
      rooms[roomId].history.push(data);
      socket.to(roomId).emit('draw', data);
    }
  });

  socket.on('clear-canvas', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].history = [];
      io.to(roomId).emit('clear-canvas');
    }
  });

  socket.on('disconnecting', () => {
    const socketRooms = [...socket.rooms];
    socketRooms.forEach(roomId => {
      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
        io.to(roomId).emit('user-left', { id: socket.id, users: rooms[roomId].users });
        
        // Clean up empty rooms after a delay? For now, keep it simple.
        if (rooms[roomId].users.length === 0) {
           // Optionally delete room data to save memory
           // delete rooms[roomId]; 
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
