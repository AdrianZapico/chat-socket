import { useState, useEffect } from 'react'; 
import './chat.css';
import io from 'socket.io-client';

interface Message {
  content: string;
  sender: string;
}

const socket = io('https://serve-chat-socketio.onrender.com'); // URL do servidor

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUserSet, setIsUserSet] = useState(false);

  useEffect(() => {
    const handleSocketMessage = (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on('chat message', handleSocketMessage);

    return () => {
      socket.off('chat message', handleSocketMessage);
    };
  }, []);

  // Função para gerar uma cor única com base no nome do usuário
  const generateColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 70%)`; // Cor no formato HSL
    return color;
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const msg = { content: message, sender: username || 'Anonymous' };
      socket.emit('chat message', msg);
      setMessage('');
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
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
              if (e.key === 'Enter') handleSetUsername();
            }}
          />
          <button onClick={handleSetUsername}>Join Chat</button>
        </div>
      ) : (
        <>
          <ul className="chat-messages">
            {messages.map((msg, index) => {
              const userColor = generateColorFromUsername(msg.sender);
              return (
                <li
                  key={index}
                  className={`chat-message ${
                    msg.sender === username ? 'self' : 'other'
                  }`}
                  style={{
                    backgroundColor: msg.sender === username ? userColor : '#2d2d2d',
                    borderLeft: `4px solid ${userColor}`,
                  }}
                >
                  <strong style={{ color: userColor }}>{msg.sender}:</strong>
                  <span>{msg.content}</span>
                </li>
              );
            })}
          </ul>
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="input-message"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
