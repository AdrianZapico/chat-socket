import React from 'react';
import './Message.css';

interface MessageProps {
  content: string;
  sender: string;
  timestamp: number;
  username: string;
  onDeleteMessage: (timestamp: number) => void; // Função de deleção
}

const Message: React.FC<MessageProps> = ({ content, sender, timestamp, username, onDeleteMessage }) => {
  const isSelf = sender === username;

  // Formatando o timestamp para exibir a hora
  const formattedTime = new Date(timestamp).toLocaleTimeString();

  // Função para verificar se o conteúdo é uma imagem
  const isImage = (content: string) => {
    return content.match(/\.(jpeg|jpg|gif|png)$/i); // Verifica se é uma imagem (jpg, jpeg, gif, png)
  };

  const handleDelete = () => {
    onDeleteMessage(timestamp); // Chama a função para deletar a mensagem
  };

  return (
    <li className={`chat-message-msg ${isSelf ? 'self' : 'other'}`}>
      <strong>{sender}: </strong>
      
      {/* Verifica se a mensagem contém uma imagem */}
      {isImage(content) ? (
        <img src={content} alt="Imagem" className="message-image" />
      ) : (
        <span>{content}</span> // Caso contrário, exibe o conteúdo como texto
      )}

      {/* Exibe a hora da mensagem */}
      <span className="message-time">{formattedTime}</span>

      {/* Apenas o usuário que enviou a mensagem pode deletar */}
      {isSelf && (
        <button onClick={handleDelete} className="delete-btn">
          Deletar
        </button>
      )}
    </li>
  );
};

export default Message;
