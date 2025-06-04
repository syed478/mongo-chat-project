const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  fileUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400  // Message expires after 24 hours (in seconds)
  }
});

module.exports = mongoose.model('Message', messageSchema);
