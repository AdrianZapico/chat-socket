import React, { useState } from 'react';
import './MessageInput.css';


interface MessageInputProps {
  handleSendMessage: (message: string) => void; 
}

const MessageInput: React.FC<MessageInputProps> = ({ handleSendMessage }) => {
  const [message, setMessage] = useState('');

  const onSend = () => {
    if (message.trim()) {
      handleSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="chat-input">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="input-message"
      />
      <button onClick={onSend}>Enviar</button>
    </div>
  );
};

export default MessageInput;
