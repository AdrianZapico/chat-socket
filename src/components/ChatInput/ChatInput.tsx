import React, { useState, useEffect } from "react";
import "./ChatInput.css";
import Icon from "@mdi/react";
import { mdiSend, mdiEmoticonOutline, mdiCloseBox } from "@mdi/js";
import EmojiPicker from "emoji-picker-react";

interface Props {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<Props> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fechar o Emoji Picker ao pressionar ESC
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);

    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage(""); // Limpa a mensagem após o envio
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onSendMessage(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectEmoji = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="chat-input-container">
      <div className="input-wrapper">
        <input
          type="text"
          className="input-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          aria-label="Campo de entrada para mensagens"
        />
        <div className="input-icons">
          <button className="icon-btn" onClick={() => setShowEmojiPicker((prev) => !prev)} title="Inserir emoji">
            <Icon path={mdiEmoticonOutline} size={0.7} />
          </button>
          <label title="Enviar imagem">
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-modal-overlay">
          <div className="emoji-modal">
            <button className="emoji-modal-close" onClick={() => setShowEmojiPicker(false)}>
              <Icon path={mdiCloseBox} size={0.8} />
            </button>
            <EmojiPicker onEmojiClick={handleSelectEmoji} />
          </div>
        </div>
      )}

      <button className="btn-chat-input" onClick={handleSend} disabled={!message.trim()} title="Enviar mensagem">
        <Icon path={mdiSend} size={0.7} />
      </button>
    </div>
  );
};

export default ChatInput;
