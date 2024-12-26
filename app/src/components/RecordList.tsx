import React from 'react';
import { Card, Button } from './shared/Card';
import styled from 'styled-components';
import { PatientRecord } from '../types/HealthTypes';
import { useTheme } from '../contexts/ThemeContext';

const RecordGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;
const StyledHeading = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: all 0.3s ease;
`;
const RecordCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  padding: 1.5rem;
  min-width: 500px;
  background: ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(28, 28, 28, 0.95)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => 
    theme === 'light' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px ${({ theme }) => 
      theme === 'light' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(0, 0, 0, 0.3)'};
  }
  
  .record-header {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid ${({ theme }) => 
      theme === 'light' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(255, 255, 255, 0.1)'};
        
    h4 {
      font-size: 1.25rem;
      font-weight: 600;
      background: linear-gradient(to right, #60a5fa, #a855f7);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  }
  
  .record-data {
    margin: 0.75rem 0;
    word-break: break-all;
    color: ${({ theme }) => 
      theme === 'light' ? '#111111' : '#ffffff'};
  }
  
  .record-meta {
    font-size: 0.9rem;
    color: ${({ theme }) => 
      theme === 'light' ? '#666666' : '#9ca3af'};
    margin: 0.75rem 0;
    
    p {
      margin: 0.5rem 0;
    }
    
    strong {
      color: ${({ theme }) => 
        theme === 'light' ? '#111111' : '#ffffff'};
    }
  }
  
  .record-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    
    button {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.3);
      }
    }
  }
`;

export function RecordList({ records, onDelete }: Props) {
  const { theme } = useTheme();

  return (
    <Card theme={theme}>
       <StyledHeading>Health Records</StyledHeading>
      <RecordGrid>
        {records.map((record) => (
          <RecordCard key={`${record.owner_id}-${record.timestamp}`} theme={theme}>
            <div className="record-header">
              <h4>{record.record_type}</h4>
            </div>
            
            <div className="record-data">
              <strong>Data:</strong> {record.data}
            </div>
            
            <div className="record-meta">
              <p><strong>Created:</strong> {new Date(record.timestamp).toLocaleString()}</p>
              <p><strong>Owner ID:</strong> {record.owner_id}</p>
              <p><strong>Status:</strong> {record.is_anonymized ? 'Anonymized' : 'Private'}</p>
              
              {record.authorized_ids.length > 0 && (
                <p>
                  <strong>Authorized Users:</strong>{' '}
                  {record.authorized_ids.join(', ')}
                </p>
              )}
            </div>

            <div className="record-actions">
              <Button onClick={() => onDelete(record.owner_id)}>
                Delete
              </Button>
            </div>
          </RecordCard>
        ))}
        
        {records.length === 0 && (
          <p className={`text-center ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            No health records found.
          </p>
        )}
      </RecordGrid>
    </Card>
  );
}