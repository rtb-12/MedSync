import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
} from '@calimero-network/calimero-client';
import { clearApplicationId } from '../utils/storage';

const Nav = styled.nav<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(255, 255, 255, 0.8)' 
      : 'rgba(17, 17, 17, 0.8)'};
  backdrop-filter: blur(12px);
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  border-bottom: 1px solid ${({ theme }) =>
    theme === 'light'
      ? 'rgba(0, 0, 0, 0.1)'
      : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
`;

const LogoDiv = styled.div<{ theme: 'light' | 'dark' }>`
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  background: linear-gradient(to right, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavButton = styled.button<{ theme: 'light' | 'dark'; variant?: 'primary' }>`
  background: ${({ variant, theme }) => 
    variant === 'primary' 
      ? 'linear-gradient(135deg, #3b82f6, #9333ea)'
      : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' 
      ? 'white' 
      : theme === 'light' 
        ? '#111111' 
        : 'white'};
  border: ${({ variant, theme }) =>
    variant === 'primary'
      ? 'none'
      : theme === 'light'
        ? '1px solid rgba(0, 0, 0, 0.2)'
        : '1px solid rgba(255, 255, 255, 0.2)'};
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
    background: ${({ variant, theme }) =>
      variant === 'primary'
        ? 'linear-gradient(135deg, #4f8ffa, #a855f7)'
        : theme === 'light'
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.1)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ThemeToggle = styled.button<{ theme: 'light' | 'dark' }>`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme === 'light' ? '#111111' : 'white'};
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

export default function Navigation() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = Boolean(getAccessToken());

  const handleLogout = () => {
    clearAppEndpoint();
    clearJWT();
    clearApplicationId();
    navigate('/auth');
  };

  if (!isLoggedIn) {
    return (
      <Nav theme={theme}>
        <LogoDiv theme={theme} onClick={() => navigate('/home')}>MedSync</LogoDiv>
        <NavButtons>
          <ThemeToggle theme={theme} onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </ThemeToggle>
          <NavButton theme={theme} variant="primary" onClick={() => navigate('/auth')}>
            Login
          </NavButton>
        </NavButtons>
      </Nav>
    );
  }

  return (
    <Nav theme={theme}>
      <LogoDiv theme={theme} onClick={() => navigate('/home')}>MedSync</LogoDiv>
      <NavButtons>
        <NavButton theme={theme} onClick={() => navigate('/patient')}>
          Patient Portal
        </NavButton>
        <NavButton theme={theme} onClick={() => navigate('/hospital')}>
          Hospital Portal
        </NavButton>
        <ThemeToggle theme={theme} onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </ThemeToggle>
        <NavButton theme={theme} variant="primary" onClick={handleLogout}>
          Logout
        </NavButton>
      </NavButtons>
    </Nav>
  );
}