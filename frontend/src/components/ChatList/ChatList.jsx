import React from "react";

function ChatList({ groupChats, onChatSelect, selectedChat }) {
  return (
    <div className="chat-list">
      <h2>Chats</h2>
      <ul>
        {groupChats.map((chat) => (
          <li
            key={chat.roomName}
            className={selectedChat === chat.roomName ? "selected" : ""}
            onClick={() => onChatSelect(chat.roomName)}
          >
            {chat.roomName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;
