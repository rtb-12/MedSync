import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
} from '@calimero-network/calimero-client';
import { clearApplicationId, getJWTObject } from '../utils/storage';
import { useAccount, useConnect } from '@starknet-react/core';
import { useAuth } from '../contexts/AuthContext';
const Nav = styled.nav<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 17, 17, 0.8)'};
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
  border-bottom: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
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

const NavButton = styled.button<{
  theme: 'light' | 'dark';
  variant?: 'primary';
}>`
  background: ${({ variant, theme }) =>
    variant === 'primary'
      ? 'linear-gradient(135deg, #3b82f6, #9333ea)'
      : 'transparent'};
  color: ${({ theme, variant }) =>
    variant === 'primary' ? 'white' : theme === 'light' ? '#111111' : 'white'};
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
  color: ${({ theme }) => (theme === 'light' ? '#111111' : 'white')};
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const WalletAddress = styled.span<{ theme: 'light' | 'dark' }>`
  color: ${({ theme }) => (theme === 'light' ? '#111111' : 'white')};
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 6px;
`;
const WalletDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div<{
  isOpen: boolean;
  theme: 'light' | 'dark';
}>`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(17, 17, 17, 0.95)'};
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  z-index: 51;
  margin-top: 0.5rem;
`;

const DropdownButton = styled(NavButton)`
  width: 100%;
  text-align: left;
  margin: 0.25rem 0;
  padding: 0.5rem 1rem;
`;
const EntityIDDisplay = styled.div<{ theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => 
    theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const EntityIDText = styled.span<{ theme: 'light' | 'dark' }>`
  font-family: monospace;
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
`;

const CopyIcon = styled.span`
  opacity: 0.7;
  font-size: 0.9rem;
`;

// Add EntityID component
const EntityID: React.FC<{ entityId: string; theme: 'light' | 'dark' }> = ({ entityId, theme }) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entityId);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <EntityIDDisplay theme={theme} onClick={handleCopy}>
      <EntityIDText theme={theme}>
        {`${entityId.slice(0, 6)}...${entityId.slice(-4)}`}
      </EntityIDText>
      <CopyIcon>{showCopied ? '✓' : '📋'}</CopyIcon>
    </EntityIDDisplay>
  );
};


// Add WalletConnectButton component before Navigation
const WalletConnectButton: React.FC<{
  theme: 'light' | 'dark';
  connectors: any[];
  connect: any;
  address: string | undefined;
}> = ({ theme, connectors, connect, address }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (address) {
    return (
      <WalletAddress theme={theme}>
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </WalletAddress>
    );
  }

  return (
    <WalletDropdown onMouseLeave={() => setIsOpen(false)}>
      <NavButton
        theme={theme}
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
      >
        Connect Wallet
      </NavButton>
      <DropdownContent isOpen={isOpen} theme={theme}>
        {connectors.map((connector) => (
          <DropdownButton
            key={connector.id}
            theme={theme}
            onClick={() => {
              connect({ connector });
              setIsOpen(false);
            }}
          >
            {connector.id}
          </DropdownButton>
        ))}
      </DropdownContent>
    </WalletDropdown>
  );
};
export default function Navigation() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = Boolean(getAccessToken());
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const [showCopied, setShowCopied] = useState(false);
  const jwtObject = getJWTObject();
  const entityId = jwtObject?.executor_public_key;

  
  const handleLogout = () => {
    clearAppEndpoint();
    clearJWT();
    clearApplicationId();
    navigate('/auth');
  };
  
  const renderRoleSpecificButtons = () => {
    switch (userRole) {
      case 'patient':
        return (
          <>
            <NavButton theme={theme} onClick={() => navigate('/patient')}>
              Patient Portal
            </NavButton>
            <NavButton theme={theme} onClick={() => navigate('/reward-pool')}>
              Rewards
            </NavButton>
          </>
        );
      case 'hospital':
        return (
          <NavButton theme={theme} onClick={() => navigate('/hospital')}>
            Hospital Portal
          </NavButton>
        );
      case 'researcher':
        return (
          <NavButton theme={theme} onClick={() => navigate('/reward-pool')}>
            Research Pool
          </NavButton>
        );
      default:
        return null;
    }
  };
  const WalletConnectButton: React.FC<{
    theme: 'light' | 'dark';
    connectors: any[];
    connect: any;
    address: string | undefined;
  }> = ({ theme, connectors, connect, address }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    if (address) {
      return (
        <WalletAddress theme={theme}>
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </WalletAddress>
      );
    }

    return (
      <WalletDropdown >
        <NavButton
          theme={theme}
          onClick={() => setIsOpen(!isOpen)}
        >
          Connect Wallet
        </NavButton>
        <DropdownContent isOpen={isOpen} theme={theme}>
          {connectors.map((connector) => (
            <DropdownButton
              key={connector.id}
              theme={theme}
              onClick={() => {
                connect({ connector });
                setIsOpen(false);
              }}
            >
              {connector.id}
            </DropdownButton>
          ))}
        </DropdownContent>
      </WalletDropdown>
    );
  };

  if (!isLoggedIn) {
    return (
      <Nav theme={theme}>
        <LogoDiv theme={theme} onClick={() => navigate('/home')}>
          MedSync
        </LogoDiv>
        <NavButtons>
          <ThemeToggle theme={theme} onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </ThemeToggle>
          {!address ? (
            connectors.map((connector) => (
              <NavButton
                key={connector.id}
                theme={theme}
                onClick={() => connect({ connector })}
              >
                Connect {connector.id}
              </NavButton>
            ))
          ) : (
            <WalletAddress theme={theme}>
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </WalletAddress>
          )}
          <NavButton
            theme={theme}
            variant="primary"
            onClick={() => navigate('/auth')}
          >
            Login
          </NavButton>
        </NavButtons>
      </Nav>
    );
  }
  
  const renderNavButtons = () => (
    <NavButtons>
      {renderRoleSpecificButtons()}
      {entityId && <EntityID entityId={entityId} theme={theme} />}
      {!address ? (
        <WalletConnectButton
          theme={theme}
          connectors={connectors}
          connect={connect}
          address={address}
        />
      ) : (
        <WalletAddress theme={theme}>
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </WalletAddress>
      )}
      <ThemeToggle theme={theme} onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </ThemeToggle>
      <NavButton theme={theme} variant="primary" onClick={handleLogout}>
        Logout
      </NavButton>
    </NavButtons>
  );

  return (
    <Nav theme={theme}>
      <LogoDiv theme={theme} onClick={() => navigate('/home')}>
        MedSync
      </LogoDiv>
      {renderNavButtons()}
    </Nav>
  );
}
