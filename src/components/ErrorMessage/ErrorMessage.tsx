import React from 'react';
import './ErrorMessage.css';


interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return message ? <div className="error-message">{message}</div> : null;
};

export default ErrorMessage;
