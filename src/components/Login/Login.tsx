import React, { useState } from 'react';
import socket from '../../socket';
import './Login.css'
import ImageComponent from '../ImageComponent';

interface Props {
  onLogin: (username: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('set username', username);

    socket.on('username taken', (message: string) => {
      setError(message); // Mostra erro caso o nome já esteja em uso
    });

    socket.on('update online users', (users: string[]) => {
      if (!error) {
        onLogin(username); // Se o nome for aceito, realiza o login
      }
    });
  };

  return (
    <div className="login-container">
      <ImageComponent/>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite seu nome"
          required
        />
        <button className='btn-login' type="submit">Entrar</button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Login;
