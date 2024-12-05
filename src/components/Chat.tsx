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
  const [lastMessageTime, setLastMessageTime] = useState<Map<string, number>>(new Map());


  // Referência para a div de "Usuários Online" arrastável
  const onlineUsersRef = useRef<HTMLDivElement | null>(null);

  //Limitador de mensagens 
  const MESSAGE_COOLDOWN = 2000;

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
    const currentTime = Date.now(); // Timestamp atual

    // Checa se o usuário já enviou mensagem recentemente
    const lastTime = lastMessageTime.get(username) || 0;

    if (currentTime - lastTime < MESSAGE_COOLDOWN) {
      setError('Você está enviando mensagens rápido demais. Aguarde um momento.');
      return;
    }


    if (message.trim()) {
      const msg = { content: message, sender: username || 'Anonymous' };
      socket.emit('chat message', msg);

      setMessage('');
      setError('');
      playSendSound();

      // Atualiza o timestamp do último envio
      setLastMessageTime(new Map(lastMessageTime.set(username, currentTime)));
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
  <div className="online-users" ref={onlineUsersRef} onMouseDown={handleMouseDown}>
    <header className="online-users-header">
      <h3>
        Usuários Online: <span className="online-number">{onlineUsers.length}</span>
      </h3>
      <button
        onClick={() => setShowOnlineUsers(prev => !prev)}
        className="toggle-users-btn"
        aria-label={showOnlineUsers ? "Ocultar lista de usuários online" : "Mostrar lista de usuários online"}
      >
        {showOnlineUsers ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.359 11.238l1.548 1.548-.707.707-1.616-1.616A8.527 8.527 0 0 1 8 13.5c-5 0-8-5.5-8-5.5a13.133 13.133 0 0 1 2.11-2.675L1.646 4.646l.707-.707 12 12-.707.707L13.359 11.238zM11.27 9.149A3.5 3.5 0 0 0 8.5 5.83l1.093 1.093A1.5 1.5 0 0 1 11.27 9.149zm-4.417-4.417l-.847-.847A8.498 8.498 0 0 1 8 2.5c5 0 8 5.5 8 5.5-.318.487-.675.942-1.064 1.364L11.27 9.15a3.5 3.5 0 0 0-2.902-2.902L6.853 4.732z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5 8-5.5 8-5.5zM8 4.5c1.933 0 3.5 1.567 3.5 3.5S9.933 11.5 8 11.5 4.5 9.933 4.5 8 6.067 4.5 8 4.5z" />
            <path d="M8 5.5A2.5 2.5 0 1 1 8 10a2.5 2.5 0 0 1 0-4.5z" />
          </svg>
        )}
      </button>
    </header>
    {showOnlineUsers && (
      <ul className="online-users-list">
        {onlineUsers.map((user, index) => (
          <li key={index}   className="online-user">
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
