import styled from 'styled-components';

export const Card = styled.div<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => 
    theme === 'light' 
      ? '#ffffff' 
      : 'rgba(17, 17, 17, 0.8)'};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
`;

export const Button = styled.button`
  background: #5dbb63;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &.secondary {
    background: #4a90e2;
  }

  &.warning {
    background: #ff4444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  background: #2c2c2c;
  border: 1px solid #3c3c3c;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 1rem;
`;