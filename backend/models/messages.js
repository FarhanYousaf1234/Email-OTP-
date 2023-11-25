const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  roomName: String, // Room name (for group chats)
  content: String,
  timestamp: Date,
  isRead: Boolean,
  isGroupMessage: {
    type: Boolean,
    default: false, // Indicates whether the message is from a group chat
  },
  isBroadcast: {
    type: Boolean,
    default: false, // Indicates whether the message is a broadcast message
  },
  // Add a field to store the list of recipients (for group and broadcast messages)
  recipients: [String],
});


const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };
