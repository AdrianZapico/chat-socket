import React from 'react';
import './Message.css';

// Definindo a interface para as props do componente
interface MessageProps {
  content: string;
  sender: string;
  timestamp: number;
  username: string;
  onDeleteMessage: (timestamp: number) => void; // Função de deleção
}

const Message: React.FC<MessageProps> = ({ content, sender, timestamp, username }) => {
  const isSelf = sender === username;

  // Formatando o timestamp para exibir a hora
  const formattedTime = new Date(timestamp).toLocaleTimeString();

  return (
    <li className={`chat-message-msg ${isSelf ? 'self' : 'other'}`}>
      <strong>{sender}: </strong> {content}
      <span className="message-time">{formattedTime}</span>
    </li>
  );
};

export default Message;
