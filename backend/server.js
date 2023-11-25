const express = require("express");
const app = express();
const cors = require("cors");
const isAuthenticated = require("./middlewares/AuthMiddleware");
const userRoutes = require("./routes/users");
const http = require("http");
const { User } = require('./models/user');
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const server = http.createServer(app);
const { Message } = require("./models/messages");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:600", // Change this to your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const MONGO_URI ="mongodb+srv://shiekhfarhanyousaf1813:farhan1234@cluster0.einbzzv.mongodb.net/chat_App";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log(err);
  });

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:600", // Change this to your frontend URL
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoutes);


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("setSocketId", async (userId) => {
    try {
      // Find the user by their ID in the database
      const user = await User.findById(userId);
      if (user) {
        user.socketId = socket.id;
        await user.save();
      }
    } catch (error) {
      console.error("Error setting socket ID:", error);
    }
  });

  // Join a room for one-to-one chat
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  // Leave a room
  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(`User left room: ${roomName}`);
  });

  // Sender sends a message
  socket.on("sendMessage", async (messageData) => {
    try {
      const { roomName, sender, content } = messageData;
      // Check if any of the fields are missing or empty
      if (!roomName || !sender || !content) {
        console.error("Invalid message data.");
        return;
      }
  
      // Send the message to the room
      io.to(roomName).emit("receiveMessage", {
        sender,
        content,
      });
  
      // Save the message to the database
      const message = new Message({
        sender,
        roomName,
        content,
        timestamp: new Date(),
        isRead: false,
        isGroupMessage: true,
      });
      await message.save();
      console.log(`Message from ${sender} in room ${roomName}: ${content}`);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
  socket.on("sendBroadcast", async (broadcastData) => {
    try {
      const { sender, content } = broadcastData;
      // Check if any of the fields are missing or empty
      if (!sender || !content) {
        console.error("Invalid broadcast message data.");
        return;
      }
      // Send the broadcast message to all connected sockets
      io.emit("receiveBroadcast", {
        sender,
        content,
      });
  
      // Save the broadcast message to the database
      const message = new Message({
        sender,
        content,
        timestamp: new Date(),
        isRead: false,
        isBroadcast: true,
      });
      await message.save();
  
      console.log(`Broadcast message from ${sender}: ${content}`);
    } catch (error) {
      console.error("Error sending broadcast message:", error);
    }
  });
  
  
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
// Create a new group chat
app.post("/api/groupchats", async (req, res) => {
  try {
    const { roomName, members } = req.body;
    // Check if the room name and members array are provided
    if (!roomName || !members || members.length === 0) {
      return res.status(400).json({ message: "Invalid group chat data." });
    }

    // Create a room for the group chat
    io.of("/").adapter.customRooms = io.of("/").adapter.customRooms || {};
    io.of("/").adapter.customRooms[roomName] = roomName;

    // Add members to the group chat
    members.forEach((member) => {
      // Use io to emit events to specific sockets
      io.to(member).emit("joinRoom", roomName);
    });

    return res.status(201).json({ message: "Group chat created successfully." });
  } catch (error) {
    console.error("Error creating group chat:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


// Get a list of all group chats
app.get("/api/groupchats", (req, res) => {
  const rooms = Object.keys(io.of("/").adapter.customRooms || {});
  return res.json({ groupChats: rooms });
});

app.post("/api/broadcast", async (req, res) => {
  try {
    const { sender, content } = req.body;
    // Check if any of the fields are missing or empty
    if (!sender || !content) {
      console.error("Invalid broadcast message data.");
      return res.status(400).json({ message: "Invalid broadcast message data." });
    }

    // Send the broadcast message to all connected sockets
    io.emit("receiveBroadcast", {
      sender,
      content,
    });

    // Save the broadcast message to the database
    const message = new Message({
      sender,
      content,
      timestamp: new Date(),
      isRead: false,
      isBroadcast: true,
    });
    await message.save();

    console.log(`Broadcast message from ${sender}: ${content}`);
    return res.status(200).json({ message: "Broadcast message sent successfully." });
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/add-contact", isAuthenticated, async (req, res) => {
  try {
    const { userMobileNumber, contactMobileNumber } = req.body;
    // Check if the user with the given userMobileNumber exists
    const user = await User.findOne({ mobileNumber: userMobileNumber });
    if (!user) {
      return res.status(400).send({ message: "User with this mobile number does not exist." });
    }
    // Check if the contact with the given contactMobileNumber exists
    const contact = await User.findOne({ mobileNumber: contactMobileNumber });
    if (!contact) {
      return res.status(400).send({ message: "Contact with this mobile number does not exist." });
    }
    // Check if the contact is already added
    const isContactAlreadyAdded = user.contacts.includes(contact._id);
    if (isContactAlreadyAdded) {
      return res.status(400).send({ message: "Contact is already added." });
    }
    // Add the contact's ObjectId to the user's contacts
    user.contacts.push(contact._id);
    // Save the updated user document
    await user.save();
    // Respond with a success message
    res.status(200).send({ message: "Contact added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
const port = 500;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
