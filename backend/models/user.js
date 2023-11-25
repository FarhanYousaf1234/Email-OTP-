const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String,
  },
  rooms: [{
    type: String, // Store room names (for group chats and one-to-one chats)
  }],
  contacts: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
});

const User = mongoose.model("User", userSchema);
module.exports = { User };
