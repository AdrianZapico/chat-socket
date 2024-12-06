import React, { useState } from 'react';
import './ChatInput.css';
import Icon from '@mdi/react';
import { mdiSend } from '@mdi/js';


interface Props {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<Props> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim(); // Remove espaços desnecessários
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(); // Permite enviar a mensagem ao pressionar "Enter"
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        className="input-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Digite sua mensagem..."
        aria-label="Campo de entrada para mensagens"
      />
      <button className='btn-chat-input' onClick={handleSend} disabled={!message.trim()}>
      <Icon path={mdiSend} size={0.5} />
      </button>
    </div>
  );
};

export default ChatInput;
