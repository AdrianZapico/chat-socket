import React, { useState } from 'react';
import './UserSetup.css';

// Definindo a interface para as props do componente
interface UserSetupProps {
  onUsernameSet: (username: string) => void; // A função que será chamada com o nome do usuário
}

const UserSetup: React.FC<UserSetupProps> = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    if (username.trim()) {
      onUsernameSet(username);
    }
  };

  return (
    <div className="username-setup">
      <input
        type="text"
        placeholder="Digite seu nome"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSubmit}>Entrar</button>
    </div>
  );
};

export default UserSetup;
