import React from "react";

function ChatArea({
  messages,
  senderMobileNumber,
  receiver,
  messageInput,
  setMessageInput,
  sendMessage,
}) {
  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2>{receiver}</h2>
      </div>
      <div className="chat-messages">
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
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatArea;
