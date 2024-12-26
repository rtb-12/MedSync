import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { HealthDataApi } from '../../api/healthDataApi';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  onRecordAdded: () => void;
}

const FormCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(255, 255, 255, 0.8)' 
      : 'rgba(17, 17, 17, 0.8)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, #60a5fa, #a855f7);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

const StyledInput = styled(Input)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => 
    theme === 'light' 
      ? '#f8fafc' 
      : 'rgba(17, 17, 17, 0.8)'};
  border: 1px solid ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme }) => 
    theme === 'light' ? '#111111' : '#ffffff'};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export function AddRecordForm({ onRecordAdded }: Props) {
  const [data, setData] = useState('');
  const [recordType, setRecordType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const api = new HealthDataApi();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.storePatientData(
        new TextEncoder().encode(data),
        recordType,
      );

      if (result.error) {
        alert(result.error.message);
        return;
      }

      setData('');
      setRecordType('');
      onRecordAdded();
    } catch (err) {
      console.error('Failed to add record:', err);
      alert('Failed to add record');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormCard theme={theme}>
      <h3>Add New Health Record</h3>
      <form onSubmit={handleSubmit}>
        <StyledInput
          theme={theme}
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter health record data"
          required
        />
        <StyledInput
          theme={theme}
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          placeholder="Record type (e.g., Blood Test, X-Ray)"
          required
        />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Record'}
        </SubmitButton>
      </form>
    </FormCard>
  );
}