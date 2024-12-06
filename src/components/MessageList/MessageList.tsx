import React from 'react';
import './MessageList.css'

interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

interface Props {
  messages: Message[];
  username: string | null;
}

const MessageList: React.FC<Props> = ({ messages, username }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <ul className="chat-messages">
      {messages.map((msg, index) => (
        <li
          key={index}
          className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}
        >
          <div className="message-content">
            <strong>{msg.sender}: </strong>
            {msg.content}
          </div>
          <span className="message-time">{formatDate(msg.timestamp)}</span>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
