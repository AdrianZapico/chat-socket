import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiContentSave, mdiCancel } from '@mdi/js';
import './MessageList.css';

interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

interface Props {
  messages: Message[];
  username: string | null;
  onDeleteMessage: (timestamp: number) => void;
  onEditMessage: (timestamp: number, newContent: string) => void;
}

const MessageList: React.FC<Props> = ({ messages, username, onDeleteMessage, onEditMessage }) => {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [userColors, setUserColors] = useState<Record<string, string>>({});
  const [menuVisible, setMenuVisible] = useState<{ [timestamp: number]: boolean }>({});
  const [editModal, setEditModal] = useState<{ visible: boolean; message: Message | null }>({ visible: false, message: null });

  // Função para gerar cor aleatória para cada usuário
  const getUserColor = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  useEffect(() => {
    if (username && !userColors[username]) {
      const color = getUserColor(username);
      setUserColors((prev) => ({ ...prev, [username]: color }));
    }
  }, [username, userColors]);

  // Função para formatar a data/hora
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  };

  // Função para rolagem automática
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Abrir e fechar o menu de edição e exclusão
  const toggleMenu = (timestamp: number) => {
    setMenuVisible((prevState) => ({
      ...prevState,
      [timestamp]: !prevState[timestamp],
    }));
  };

  // Função para abrir o modal de edição
  const openEditModal = (message: Message) => {
    if (message.sender === username) { // Apenas permite editar se a mensagem for do usuário logado
      setEditModal({ visible: true, message });
    }
  };

  // Função para salvar a edição da mensagem
  const handleSaveEdit = () => {
    if (editModal.message) {
      onEditMessage(editModal.message.timestamp, editModal.message.content);
      closeEditModal();
    }
  };

  // Função para fechar o modal de edição
  const closeEditModal = () => {
    setEditModal({ visible: false, message: null });
  };

  return (
    <>
      <ul className="chat-messages">
        {messages.map((msg) => (
          <li key={msg.timestamp} className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}>
            <div className="message-content">
              <strong style={{ color: userColors[msg.sender] || getUserColor(msg.sender) }}>
                {msg.sender}:
              </strong>
              <span>{msg.content}</span>
            </div>
            <span className="message-time">{formatDate(msg.timestamp)}h</span>

            {/* Botão para abrir o menu */}
            <button onClick={() => toggleMenu(msg.timestamp)} className="menu-button">
              ⋮
            </button>

            {/* Menu de edição/exclusão */}
            {menuVisible[msg.timestamp] && (
              <div className="message-menu">
                {/* Exibe o botão de editar apenas para o usuário que enviou a mensagem */}
                {msg.sender === username && (
                  <button onClick={() => openEditModal(msg)}>Editar</button>
                )}
                <button onClick={() => onDeleteMessage(msg.timestamp)}>Excluir</button>
              </div>
            )}
          </li>
        ))}
        <div ref={messageEndRef} />
      </ul>

      {/* Modal para edição */}
      {editModal.visible && editModal.message && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>Editar mensagem</h3>
            <textarea
              className="text-area-edit"
              value={editModal.message.content}
              onChange={(e) =>
                setEditModal((prev) => ({
                  ...prev,
                  message: { ...prev.message!, content: e.target.value },
                }))
              }
            />
            <div className="modal-buttons">
              <button onClick={handleSaveEdit}>
                <Icon path={mdiContentSave} size={1.2} />
              </button>
              <button onClick={closeEditModal}>
                <Icon path={mdiCancel} size={1.2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;
