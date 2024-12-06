import { io } from 'socket.io-client';

// Configure a URL do servidor
const socket = io('https://serve-chat-socketio.onrender.com', {
  transports: ['websocket'],
  reconnection: true,        // Habilita tentativas de reconexão
  reconnectionAttempts: 5,   // Número máximo de tentativas de reconexão
  timeout: 10000, 
});

export default socket;