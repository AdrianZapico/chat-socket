import { useState, useEffect } from 'react';
import './chat.css';
import io from 'socket.io-client';
import ImageComponent from './ImageComponent';



interface Message {
  content: string;
  sender: string;
}

// Conexão com o servidor (use a URL de produção quando necessário)
const socket = io('https://serve-chat-socketio.onrender.com', {
  transports: ['websocket'],
});

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUserSet, setIsUserSet] = useState(false);

  // Efeito para ouvir mensagens do servidor
  useEffect(() => {
    const handleSocketMessage = (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]); // Adiciona nova mensagem
    };

    socket.on('chat message', handleSocketMessage); // Escuta o evento 'chat message'

    // Verifica a conexão
    socket.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor');
    });

    // Limpa o listener ao desmontar
    return () => {
      socket.off('chat message', handleSocketMessage);
    };
  }, []);

  // Função para gerar cor única com base no nome
  const generateColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `#${((hash >> 24) & 0xFF).toString(16)}${((hash >> 16) & 0xFF).toString(16)}${((hash >> 8) & 0xFF).toString(16)}`;
  };

  // Envia a mensagem ao servidor
  const handleSendMessage = () => {
    if (message.trim()) {
      const msg = { content: message, sender: username || 'Anonymous' };
      socket.emit('chat message', msg); // Envia a mensagem
      setMessage(''); // Limpa a caixa de mensagem
    }
  };

  // Configura o nome de usuário
  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUserSet(true); // Marca que o nome foi configurado
    } else {
      alert('Please enter a valid username.'); // Alerta para nome inválido
    }
  };

  return (
    <div className="chat-container">
    
      {!isUserSet ? (
        
        
        <div className="username-setup">
         <ImageComponent/>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Atualiza o nome
            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()} // Entra ao pressionar 'Enter'
          />
          <button onClick={handleSetUsername}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-content">
          <ul className="chat-messages">
            {messages.map((msg, index) => {
              const userColor = generateColorFromUsername(msg.sender); // Gera cor personalizada baseada no nome
              return (
                <li
                  key={index}
                  className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}
                  style={{ backgroundColor: userColor }}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.content}
                </li>
              );
            })}
          </ul>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)} // Atualiza a mensagem
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} // Envia a mensagem ao pressionar 'Enter'
              className="input-message"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
