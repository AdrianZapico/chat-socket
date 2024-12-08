import React, { useState, useEffect } from 'react';
import socket from "../../socket";
import MessageList from '../MessageList/MessageList';
import ChatInput from '../ChatInput/ChatInput';
import OnlineUsers from '../OnlineUsers/OnlineUsers';
import Login from '../Login/Login';
import './ChatContainer.css';

interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    socket.on('chat message', (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('update online users', (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('chat message');
      socket.off('update online users');
    };
  }, []);

  const handleSendMessage = (content: string) => {
    if (username) {
      const message = { sender: username, content, timestamp: Date.now() };
      socket.emit('chat message', message); // Envia a mensagem para o servidor
    }
  };

  const handleLogin = (user: string) => {
    setUsername(user);
  };

  // Função para editar uma mensagem
  const handleEditMessage = (timestamp: number, newContent: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.timestamp === timestamp ? { ...msg, content: newContent } : msg
      )
    );
    // Envie a mensagem editada para o servidor
    socket.emit('edit message', { timestamp, newContent });
  };

  // Função para deletar a mensagem
  const handleDeleteMessage = (timestamp: number) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.timestamp !== timestamp));
    // Envie a remoção para o servidor se necessário
    socket.emit('delete message', timestamp);
  };

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="chat-container">
      <OnlineUsers onlineUsers={onlineUsers} />
      <MessageList
        messages={messages}
        username={username}
        onDeleteMessage={handleDeleteMessage}
        onEditMessage={handleEditMessage}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
