import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddContact from "../components/Addcontact/Addcontact";

const serverEndpoint = "http://localhost:500"; // Replace with your server URL

function App() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [senderMobileNumber, setSenderMobileNumber] = useState(""); // Store the sender's mobile number
  const [receiver, setReceiver] = useState(""); // Initialize receiver as an empty string
  const [showAddContact, setShowAddContact] = useState(false);
  const [userMobileNumber, setUserMobileNumber] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Create a socket connection when the component mounts
    const socketInstance = io(serverEndpoint);

    // Set up the socket connection
    setSocket(socketInstance);

    // Disconnect from the server when the component unmounts
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("receiveMessage", (message) => {
        // Update the local state with the new message
        setMessages((prevMessages) => [...prevMessages, message]);

        // Store messages in local storage
        localStorage.setItem(
          "messages",
          JSON.stringify([...messages, message])
        );
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("Disconnected from the server.");
        setSocket(null);
      });
    }
  }, [socket]);

  useEffect(() => {
    // Fetch the user's mobile number from the backend when the component mounts
    const fetchUserMobileNumber = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:500/api/users/user-mobile-number",
          {
            headers: {
              Authorization: token,
            },
          }
        );
        // Update the user's mobile number
        setUserMobileNumber(response.data.mobileNumber);
        // Set the sender's mobile number
        setSenderMobileNumber(response.data.mobileNumber);
      } catch (error) {
        console.error("Error fetching user's mobile number:", error);
      }
    };

    fetchUserMobileNumber();
  }, []);

  const sendMessage = () => {
    if (!socket) {
      console.error("Not connected to the server.");
      return;
    }
    if (!messageInput.trim()) {
      console.error("Please enter a message.");
      return;
    }
    // Check if a recipient is selected
    if (!receiver) {
      console.error("Please enter a recipient's mobile number.");
      return;
    }
    const newMessage = {
      content: messageInput, // Message content
      sender: senderMobileNumber, // Sender's mobile number
      receiver, // Recipient's mobile number
      timestamp: new Date().toLocaleTimeString(),
    };
    // Send the message to the server
    socket.emit("sendMessage", newMessage);
    // Update the local message list
    setMessages([...messages, newMessage]);
    // Clear the message input
    setMessageInput("");
  };

  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem("token");
    // Use the navigate function to navigate to the '/' page
    navigate("/");
  };

  const toggleAddContact = () => {
    setShowAddContact(!showAddContact);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>WhatsApp Clone</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="user-info">
        Registered Mobile Number: {userMobileNumber}
      </div>
      <div className="message-count">Messages: {messages.length}</div>
      <div className="chat-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === senderMobileNumber ? "sent" : "received"
            }`}
          >
            <p>{message.content}</p>
            <span>{message.timestamp}</span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type your message"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <input
          type="text"
          placeholder="Recipient's Mobile Number"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div className="add-contact-container">
        <button onClick={toggleAddContact}>
          {showAddContact ? "Add Contact" : "Add Contact"}
        </button>
        {showAddContact && <AddContact senderMobileNumber ={senderMobileNumber } />}
      </div>
    </div>
  );
}
export default App;
