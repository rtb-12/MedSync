import React, { useState } from 'react';
import { Card, Button, Input } from '../components/shared/Card';
import styled from 'styled-components';
import { HealthDataApi } from '../api/healthDataApi';
import { useTheme } from '../contexts/ThemeContext';

const StyledCard = styled(Card)`
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, #60a5fa, #a855f7);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const ConsentList = styled.div`
  margin-top: 1.5rem;
`;

const ConsentItem = styled.div<{ theme: 'light' | 'dark' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 17, 17, 0.8)'};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px
      ${({ theme }) =>
        theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  }

  span {
    color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const StyledInput = styled(Input)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) =>
    theme === 'light' ? '#f8fafc' : 'rgba(17, 17, 17, 0.8)'};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }
`;

export function ConsentManager() {
  const [entityId, setEntityId] = useState('');
  const [consents, setConsents] = useState<string[]>([]);
  const { theme } = useTheme();
  const api = new HealthDataApi();

  async function handleGrantConsent() {
    try {
      const zkProof = new Uint8Array();
      await api.addConsent(entityId, zkProof);
      setConsents([...consents, entityId]);
      setEntityId('');
    } catch (err) {
      console.error('Failed to grant consent:', err);
      alert('Failed to grant consent');
    }
  }

  async function handleRevokeConsent(id: string) {
    try {
      await api.revokeAccess(id);
      setConsents(consents.filter((c) => c !== id));
    } catch (err) {
      console.error('Failed to revoke consent:', err);
      alert('Failed to revoke consent');
    }
  }

  return (
    <StyledCard theme={theme}>
      <h3>Manage Data Access</h3>
      <InputWrapper>
        <StyledInput
          theme={theme}
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Enter hospital/researcher ID"
        />
        <Button onClick={handleGrantConsent}>Grant Access</Button>
      </InputWrapper>

      <ConsentList>
        {consents.map((id) => (
          <ConsentItem key={id} theme={theme}>
            <span>{id}</span>
            <Button className="warning" onClick={() => handleRevokeConsent(id)}>
              Revoke
            </Button>
          </ConsentItem>
        ))}
      </ConsentList>
    </StyledCard>
  );
}
