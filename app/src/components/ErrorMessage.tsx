import React from 'react';
import styled from 'styled-components';

const ErrorDiv = styled.div`
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(220, 38, 38, 0.1);
`;

interface ErrorMessageProps {
    message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
    if (!message) return null;

    return (
        <ErrorDiv
            role="alert"
            aria-live="polite"
        >
            {message}
        </ErrorDiv>
    );
};

export default ErrorMessage;