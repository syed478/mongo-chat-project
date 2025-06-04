const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  fileUrl: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
