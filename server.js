require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Message = require('./models/Message');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// Socket.io logic
io.on('connection', async (socket) => {
  console.log('🔌 User connected');

  // Send last 24 hours of messages
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentMessages = await Message.find({ createdAt: { $gte: oneDayAgo } }).sort({ createdAt: 1 });
  socket.emit('chat history', recentMessages);

  socket.on('chat message', async (msg) => {
    const saved = await new Message(msg).save();
    io.emit('chat message', saved); // send to all clients
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
