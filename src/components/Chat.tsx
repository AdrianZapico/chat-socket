import { useState, useEffect } from 'react';
import './chat.css';
import io from 'socket.io-client';
import myImage from '../assets/images/funny chat card.png';
import otherImage from '../assets/images/funny chat logo.png'

interface Message {
  content: string;
  sender: string;
}

const socket = io('https://serve-chat-socketio.onrender.com'); // URL do servidor

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

  // Função para gerar cor única a partir do nome do usuário
  const generateColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `#${((hash >> 24) & 0xFF).toString(16)}${((hash >> 16) & 0xFF).toString(16)}${((hash >> 8) & 0xFF).toString(16)}`;
  };

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
      <div>
        <img style={{ width: '150px', height: '150px', opacity: '0.4' }} src={otherImage} alt="My Image" />
      </div>
      {!isUserSet ? (

        <div className="username-setup">
          <div>
            <img style={{ width: '250px', height: '250px', borderRadius: '50% 50% 50% 50%' }} src={myImage} alt="My Image" />
          </div>

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
            {messages.map((msg, index) => {
              const userColor = generateColorFromUsername(msg.sender); // Obtendo a cor do usuário
              return (
                <li
                  key={index}
                  className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}
                  style={{
                    backgroundColor: msg.sender === username ? userColor : '#333',
                    borderLeft: `4px solid ${userColor}` // Adicionando uma borda para destacar ainda mais
                  }}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.content}
                </li>
              );
            })}
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
            className="input-message"
          />
          <button onClick={handleSendMessage}>Send</button>
        </>
      )}
    </div>
  );
};

export default Chat;
