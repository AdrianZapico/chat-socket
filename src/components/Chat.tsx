import { useState, useEffect, useRef } from 'react';
import './chat.css';
import io from 'socket.io-client';
import ImageComponent from './ImageComponent';

// Caminhos para os arquivos de áudio
const sendAudioUrl = '/assets/audio/send.mp3'; // Áudio para envio de mensagem

// Interface para mensagens
interface Message {
  content: string;
  sender: string;
}

// Configuração do socket
const socket = io('https://serve-chat-socketio.onrender.com', {
  transports: ['websocket'],
});

// Limite de caracteres por mensagem
const MAX_MESSAGE_LENGTH = 200;

const Chat = () => {
  // Estados
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUserSet, setIsUserSet] = useState(false);
  const [error, setError] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // Adiciona estado para usuários online
  const [showOnlineUsers, setShowOnlineUsers] = useState(false); // Controle de visibilidade da lista

  // Referência para a div de "Usuários Online" arrastável
  const onlineUsersRef = useRef<HTMLDivElement | null>(null);

  // Variáveis para armazenar a posição inicial de arrasto
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  /** Função para tocar áudio ao enviar mensagem */
  const playSendSound = () => {
    const sendAudio = new Audio(sendAudioUrl);
    sendAudio.play().catch((err) => console.error('Erro ao tocar áudio:', err));
  };

  /** Efeito para escutar mensagens e usuários online do servidor */
  useEffect(() => {
    const handleSocketMessage = (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const handleOnlineUsersUpdate = (users: string[]) => {
      setOnlineUsers(users); // Atualiza a lista de usuários online
    };

    socket.on('chat message', handleSocketMessage);
    socket.on('update online users', handleOnlineUsersUpdate);

    socket.on('connect', () => console.log('Conectado ao servidor'));
    socket.on('disconnect', () => console.log('Desconectado do servidor'));

    return () => {
      socket.off('chat message', handleSocketMessage);
      socket.off('update online users', handleOnlineUsersUpdate);
    };
  }, []);

  /** Gera uma cor única para o nome do usuário */
  const generateColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `#${((hash >> 24) & 0xff).toString(16)}${((hash >> 16) & 0xff).toString(16)}${((hash >> 8) & 0xff).toString(16)}`;
  };

  /** Envia mensagem ao servidor */
  const handleSendMessage = () => {
    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      setError(`Mensagem muito longa! Limite: ${MAX_MESSAGE_LENGTH} caracteres.`);
      return;
    }

    if (message.trim()) {
      const msg = { content: message, sender: username || 'Anonymous' };
      socket.emit('chat message', msg);
      setMessage('');
      setError('');
      playSendSound();
    }
  };

  /** Configura o nome de usuário */
  const handleSetUsername = () => {
    if (username.trim()) {
      socket.emit('set username', username); // Envia o nome de usuário para o servidor
      setIsUserSet(true);
    } else {
      alert('Por favor, insira um nome de usuário válido.');
    }
  };

  // Manipulação de teclas para permitir Shift + Enter para quebra de linha
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Permite quebra de linha ao pressionar Shift + Enter
      return;
    } else if (e.key === 'Enter') {
      // Envia a mensagem ao pressionar Enter
      e.preventDefault();
      handleSendMessage();
    }
  };

  /** Função de arraste da div */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (onlineUsersRef.current) {
      isDragging.current = true;
      startX.current = e.clientX;
      startY.current = e.clientY;

      // Previne o comportamento padrão para não selecionar texto ao arrastar
      e.preventDefault();
    }
  };

  /** Função de movimentação durante o arraste */
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && onlineUsersRef.current) {
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      onlineUsersRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  /** Função para parar o arraste */
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    // Adiciona os eventos para o arraste
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Remove os eventos quando o componente for desmontado
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="chat-container">
      {/* Configuração de nome de usuário */}
      {!isUserSet ? (
        <div className="username-setup">
          <ImageComponent />
          <input
            type="text"
            placeholder="Digite seu nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
          />
          <button onClick={handleSetUsername}>Entrar no Chat</button>
        </div>
      ) : (
        // Conteúdo do chat
        <div className="chat-content">
        
          <ul className="chat-messages">
            {messages.map((msg, index) => {
              const userColor = generateColorFromUsername(msg.sender);
              return (
                <li
                  key={index}
                  className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}
                  style={{
                    backgroundColor: userColor,
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '90%',
                  }}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.content}
                </li>
              );
            })}
          </ul>
          <div className="chat-input">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.length > MAX_MESSAGE_LENGTH) {
                  setError(`Limite de ${MAX_MESSAGE_LENGTH} caracteres.`);
                } else {
                  setError('');
                }
              }}
              onKeyDown={handleKeyDown}
              className="input-message"
              maxLength={MAX_MESSAGE_LENGTH + 1}
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {/* Usuários Online */}
      {isUserSet && (
        <div
          className="online-users"
          ref={onlineUsersRef}
          onMouseDown={handleMouseDown} // Inicia o arraste
        >
          <h3>
            Usuários Online: <span className="online-number">{onlineUsers.length}{' '}</span>
            <button
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="toggle-users-btn"
            >
              {showOnlineUsers ? 'Ocultar' : 'Mostrar'}
            </button>
          </h3>
          {showOnlineUsers && (
            <ul>
              {onlineUsers.map((user, index) => (
                <li key={index} className="online-user">
                  <span className="status-dot"></span> {user}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
