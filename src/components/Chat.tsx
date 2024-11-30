import React, { useState, useEffect } from 'react';
import './chat.css';
import io from 'socket.io-client';

interface Message {
  content: string;
  sender: string;
}

const socket = io('http://localhost:3000'); // URL do servidor

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUserSet, setIsUserSet] = useState(false); // Flag para verificar se o usuário foi configurado

  useEffect(() => {
    const handleSocketMessage = (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on('chat message', handleSocketMessage);

    return () => {
      socket.off('chat message', handleSocketMessage);
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const msg = { content: message, sender: username || 'Anonymous' };
      socket.emit('chat message', msg); // Envia a mensagem junto com o nome do remetente
      setMessage('');
    }
  };

  const handleSetUsername = () => {
    if (username.trim().length > 0) {
      setIsUserSet(true);
    } else {
      alert('Please enter a valid username.');
    }
  };

  return (
    <div className="chat-container">
      {!isUserSet ? (
        <div className="username-setup">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSetUsername();
              }
            }}
          />
          <button onClick={handleSetUsername}>Join Chat</button>
        </div>
      ) : (
        <>
          <ul className="chat-messages">
            {messages.map((msg, index) => (
              <li
                key={index}
                className={`chat-message ${
                  msg.sender === username ? 'self' : 'other'
                }`}
              >
                <strong>{msg.sender}: </strong>
                {msg.content}
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </>
      )}
    </div>
  );
};

export default Chat;
