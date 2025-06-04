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

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// File Upload (Multer)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// Socket.IO Handling
io.on('connection', socket => {
  console.log('User connected');

  socket.on('chat message', async msg => {
    const saved = await new Message(msg).save();
    io.emit('chat message', saved);
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
