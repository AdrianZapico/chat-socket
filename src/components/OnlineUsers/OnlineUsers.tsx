import React, { useState, useRef } from 'react';
import './OnlineUsers.css';

interface Props {
  onlineUsers: string[];
}

const OnlineUsers: React.FC<Props> = ({ onlineUsers }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Função para alternar a visibilidade
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  // Função para começar a arrastar
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  // Função para arrastar
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition((prevPosition) => ({
        x: prevPosition.x + deltaX,
        y: prevPosition.y + deltaY,
      }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Função para parar de arrastar
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Definindo a posição do contêiner com tipos corretos
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.y}px`, // Garantindo que é uma string com 'px'
    left: `${position.x}px`, // Garantindo que é uma string com 'px'
    cursor: isDragging ? 'grabbing' : 'grab', // Cursor de arrastar
  };

  return (
    <div
      ref={containerRef}
      className="online-users"
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button onClick={toggleVisibility} className="toggle-button">
        {isVisible ? '' : ''} Online
      </button>
      {isVisible && (
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>
              <span className="status-dot"></span>
              {user}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OnlineUsers;
