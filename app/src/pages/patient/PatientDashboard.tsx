import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AddRecordForm } from './AddRecordForm';
import { ConsentManager } from '../../components/ConsentManager';
import { RecordList } from '../../components/RecordList';
import { HealthDataApi } from '../../api/healthDataApi';
import { PatientRecord } from '../../types/HealthTypes';
import ErrorMessage from '../../components/ErrorMessage';
import { LoadingState } from '../../components/shared/LoadingState';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardWrapper = styled.div<{ theme: 'light' | 'dark' }>`
  padding: 6rem 2rem 2rem;
  min-height: 100vh;
  min-width: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => 
    theme === 'light'
      ? 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)'
      : 'linear-gradient(135deg, #111827 0%, #111111 50%, #111827 100%)'};

  h1 {
    margin-bottom: 2rem;
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    background: linear-gradient(to right, #60a5fa, #a855f7, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: text 5s ease infinite;
  }

  .grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: 2fr 1fr;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
`;

const ErrorContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
`;

export default function PatientDashboard() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const api = new HealthDataApi();

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getPatientRecords();
      if (!result.error && result.data) {
        setRecords(result.data);
      } else {
        setError(result.error?.message ?? 'Failed to fetch records');
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setError('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function handleDelete(id: string) {
    try {
      await api.removeRecord(id);
      fetchRecords();
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError('Failed to delete record');
    }
  }

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <DashboardWrapper theme={theme}>
      <h1>Patient Health Records</h1>
      {error && <ErrorContainer>{error}</ErrorContainer>}
      <div className="grid">
        <div>
          <AddRecordForm onRecordAdded={fetchRecords} />
          {isLoading ? (
            <LoadingState />
          ) : (
            <RecordList records={records} onDelete={handleDelete} />
          )}
        </div>
        <ConsentManager />
      </div>
    </DashboardWrapper>
  );
}