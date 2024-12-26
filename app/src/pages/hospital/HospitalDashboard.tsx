// src/pages/hospital/HospitalDashboard.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { HealthDataApi } from '../../api/healthDataApi';
import { PatientRecord } from '../../types/HealthTypes';
import { LoadingState } from '../../components/shared/LoadingState';

const DashboardWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }
`;

const AccessRequestForm = styled(Card)`
  margin-bottom: 2rem;

  .form-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
  }
`;

const RecordGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

export function HospitalDashboard() {
  const [authorizedRecords, setAuthorizedRecords] = useState<PatientRecord[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const api = new HealthDataApi();

  async function fetchAuthorizedRecords() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getAuthorizedRecords();
      if (!result.error && result.data) {
        setAuthorizedRecords(result.data);
      } else {
        setError(result.error?.message ?? 'Failed to fetch records');
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setError('Failed to fetch authorized records');
    } finally {
      setIsLoading(false);
    }
  }

  async function requestAccess(patientId: string) {
    if (!patientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    try {
      const result = await api.requestAccess(patientId);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Refresh records after successful request
      fetchAuthorizedRecords();
      setPatientId('');
    } catch (err) {
      console.error('Failed to request access:', err);
      setError('Failed to request access');
    }
  }

  useEffect(() => {
    fetchAuthorizedRecords();
  }, []);

  return (
    <DashboardWrapper>
      <h1>Hospital Dashboard</h1>

      <AccessRequestForm>
        <h3>Request Patient Access</h3>
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
        )}
        <div className="form-row">
          <Input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter patient ID"
          />
          <Button onClick={() => requestAccess(patientId)}>
            Request Access
          </Button>
        </div>
      </AccessRequestForm>

      <Card>
        <h3>Authorized Records</h3>
        {isLoading ? (
          <LoadingState />
        ) : (
          <RecordGrid>
            {authorizedRecords.map((record) => (
              <Card key={record.data_hash}>
                <h4>{record.record_type}</h4>
                <p>Patient: {record.owner_id}</p>
                <p>Added: {new Date(record.timestamp).toLocaleString()}</p>
                <p>Status: {record.is_anonymized ? 'Anonymized' : 'Private'}</p>
                {record.is_anonymized ? (
                  <Button
                    onClick={() => window.alert('Viewing anonymized data...')}
                  >
                    View Anonymized Data
                  </Button>
                ) : (
                  <Button
                    className="secondary"
                    onClick={() => window.alert('Viewing encrypted data...')}
                  >
                    View Data
                  </Button>
                )}
              </Card>
            ))}
            {authorizedRecords.length === 0 && (
              <p>No authorized records available.</p>
            )}
          </RecordGrid>
        )}
      </Card>
    </DashboardWrapper>
  );
}
