import { useState, useEffect } from 'react';
import './chat.css';
import io from 'socket.io-client';
import Card from '../assets/images/funnyChatCard.png';

interface Message {
  content: string;
  sender: string;
}

const socket = io('https://serve-chat-socketio.onrender.com'); // Conectar ao servidor

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Armazena mensagens
  const [message, setMessage] = useState(''); // Armazena a mensagem atual
  const [username, setUsername] = useState(''); // Armazena o nome de usuário
  const [isUserSet, setIsUserSet] = useState(false); // Flag para verificar se o nome foi configurado

  // Efeito para ouvir mensagens do servidor
  useEffect(() => {
    const handleSocketMessage = (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]); // Adiciona nova mensagem ao estado
    };

    socket.on('chat message', handleSocketMessage); // Escuta o evento 'chat message'

    return () => {
      socket.off('chat message', handleSocketMessage); // Limpa o ouvinte quando o componente for desmontado
    };
  }, []);

  // Função para gerar cor única baseada no nome de usuário
  const generateColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `#${((hash >> 24) & 0xFF).toString(16)}${((hash >> 16) & 0xFF).toString(16)}${((hash >> 8) & 0xFF).toString(16)}`;
  };

  // Envia a mensagem para o servidor
  const handleSendMessage = () => {
    if (message.trim()) {
      const msg = { content: message, sender: username || 'Anonymous' }; // Cria a mensagem
      socket.emit('chat message', msg); // Envia a mensagem ao servidor
      setMessage(''); // Limpa a caixa de texto
    }
  };

  // Define o nome de usuário
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
          <img className='image-container' src={Card}/>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Atualiza o nome de usuário
            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()} // Configura o nome ao pressionar 'Enter'
          />
          <button onClick={handleSetUsername}>Join Chat</button>
        </div>
      ) : (
        <>
          <ul className="chat-messages">
            {messages.map((msg, index) => {
              const userColor = generateColorFromUsername(msg.sender); // Gera a cor para o usuário
              return (
                <li
                  key={index}
                  className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}
                  style={{
                    backgroundColor: msg.sender === username ? userColor : '#333',
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
            onChange={(e) => setMessage(e.target.value)} // Atualiza a mensagem digitada
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} // Envia a mensagem ao pressionar 'Enter'
            className="input-message"
            placeholder='😺...'
          />
          <button className='send
          ' onClick={handleSendMessage}>Send</button>
        </>
      )}
    </div>
  );
};

export default Chat;
