import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Container = styled.div<{ theme: 'light' | 'dark' }>`
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: ${({ theme }) =>
    theme === 'light' ? '#f8fafc' : '#1a1b23'};
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
`;

const RoleCard = styled.div<{ theme: 'light' | 'dark' }>`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => 
    theme === 'light' ? '#ffffff' : '#1f2937'};
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  h2 {
    text-align: center;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #3b82f6, #9333ea);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const RoleButton = styled.button<{ theme: 'light' | 'dark' }>`
  padding: 1.5rem;
  border: 1px solid ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #3b82f6, #9333ea);
    color: white;
  }

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }

  p {
    font-size: 0.875rem;
    opacity: 0.8;
  }
`;

export function RoleSelection() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'patient' | 'hospital' | 'researcher') => {
    // Generate a unique ID for the user
    const uniqueId = `${role}_${Date.now()}`;
    login(uniqueId, role);
    
    // Redirect based on role
    switch(role) {
      case 'patient':
        navigate('/home');
        break;
      case 'hospital':
        navigate('/home');
        break;
      case 'researcher':
        navigate('/home');
        break;
    }
  };

  return (
    <Container theme={theme}>
      <RoleCard theme={theme}>
        <h2>Select Your Role</h2>
        <RoleGrid>
          <RoleButton 
            theme={theme}
            onClick={() => handleRoleSelect('patient')}
          >
            <h3>Patient</h3>
            <p>Access and manage your health records</p>
          </RoleButton>

          <RoleButton 
            theme={theme}
            onClick={() => handleRoleSelect('hospital')}
          >
            <h3>Hospital</h3>
            <p>Manage patient records and access data</p>
          </RoleButton>

          <RoleButton 
            theme={theme}
            onClick={() => handleRoleSelect('researcher')}
          >
            <h3>Researcher</h3>
            <p>Create reward pools and access anonymized data</p>
          </RoleButton>
        </RoleGrid>
      </RoleCard>
    </Container>
  );
}