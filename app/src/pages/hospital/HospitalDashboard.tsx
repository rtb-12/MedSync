import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { HealthDataApi } from '../../api/healthDataApi';
import { PatientRecord } from '../../types/HealthTypes';
import { LoadingState } from '../../components/shared/LoadingState';
import { useTheme } from '../../contexts/ThemeContext';

const CardStyles = `
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 17, 17, 0.8)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
`;

const DashboardWrapper = styled.div<{ theme: 'light' | 'dark' }>`
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: ${({ theme }) => (theme === 'light' ? '#f8fafc' : '#1a1b23')};
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const AccessRequestForm = styled(Card)<{ theme: 'light' | 'dark' }>`
  margin-bottom: 2rem;
  ${CardStyles}

  .form-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
  }
`;

const RecordsCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  ${CardStyles}
`;

const RecordGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
`;

const RecordCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(31, 41, 55, 0.95)'};
  backdrop-filter: blur(12px);
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  h4 {
    color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
  }
`;
const StyledButton = styled(Button)<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant }) =>
    variant === 'primary'
      ? 'linear-gradient(135deg, #3b82f6, #9333ea)'
      : 'transparent'};
  color: ${({ variant }) => (variant === 'primary' ? '#ffffff' : 'inherit')};
  border: ${({ variant, theme }) =>
    variant === 'primary'
      ? 'none'
      : `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`};
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
    background: ${({ variant }) =>
      variant === 'primary'
        ? 'linear-gradient(135deg, #4f8ffa, #a855f7)'
        : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ErrorMessage = styled.div<{ theme: 'light' | 'dark' }>`
  color: #ef4444;
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(254, 226, 226, 0.5)' : 'rgba(127, 29, 29, 0.5)'};
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

interface MedicalDetails {
  diagnosis: string;
  medications: string[];
  testResults: string[];
  notes: string;
  symptoms: string[];
  recordType: string;
  date: string;
  doctorName: string;
}

export function HospitalDashboard() {
  const { theme } = useTheme();
  const [authorizedRecords, setAuthorizedRecords] = useState<PatientRecord[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const api = new HealthDataApi();

  const parseMedicalDetails = (data: string): MedicalDetails | null => {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse medical details:', err);
      return null;
    }
  };

  async function fetchAuthorizedRecords() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.listAuthorizedReports();
      if (!result.error && result.data) {
        console.log('Authorized records:', result.data);
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
    <DashboardWrapper theme={theme}>
      <ContentContainer>
        <AccessRequestForm theme={theme}>
          <h3>Request Patient Access</h3>
          {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
          <div className="form-row">
            <Input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID"
              style={{ flex: 1 }}
            />
            <StyledButton
              variant="primary"
              onClick={() => requestAccess(patientId)}
            >
              Request Access
            </StyledButton>
          </div>
        </AccessRequestForm>

        <RecordsCard theme={theme}>
          <h3>Authorized Records</h3>
          {isLoading ? (
            <LoadingState />
          ) : (
            <RecordGrid>
              {authorizedRecords.map((record) => {
                const medicalDetails = parseMedicalDetails(record.data);
                
                return (
                  <RecordCard key={`${record.owner_id}-${record.timestamp}`} theme={theme}>
                    <div className="record-header">
                      <h4>{medicalDetails?.recordType || record.record_type}</h4>
                    </div>

                    {medicalDetails && (
                      <div className="record-details">
                        {medicalDetails.diagnosis && (
                          <div className="detail-section">
                            <h5>Diagnosis</h5>
                            <p>{medicalDetails.diagnosis}</p>
                          </div>
                        )}

                        {medicalDetails.medications.length > 0 && (
                          <div className="detail-section">
                            <h5>Medications</h5>
                            <ul>
                              {medicalDetails.medications.map((med, idx) => (
                                <li key={idx}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {medicalDetails.testResults.length > 0 && (
                          <div className="detail-section">
                            <h5>Test Results</h5>
                            <ul>
                              {medicalDetails.testResults.map((result, idx) => (
                                <li key={idx}>{result}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {medicalDetails.notes && (
                          <div className="detail-section">
                            <h5>Notes</h5>
                            <p>{medicalDetails.notes}</p>
                          </div>
                        )}

                        <div className="detail-section">
                          <h5>Record Details</h5>
                          <p><strong>Date:</strong> {medicalDetails.date}</p>
                          <p><strong>Patient ID:</strong> {record.owner_id}</p>
                          <p><strong>Status:</strong> {record.is_anonymized ? 'Anonymized' : 'Private'}</p>
                        </div>
                      </div>
                    )}

                    <StyledButton
                      theme={theme}
                      variant="primary"
                      onClick={async () => {
                        try {
                          const result = await api.accessPatientData(
                            record.owner_id,
                            record.owner_id
                          );
                          if (result.error) {
                            setError(result.error.message);
                            return;
                          }
                          const decryptedData = new TextDecoder().decode(result.data);
                          console.log('Decrypted data:', decryptedData);
                        } catch (err) {
                          console.error('Failed to access data:', err);
                          setError('Failed to access patient data');
                        }
                      }}
                    >
                      View Full Record
                    </StyledButton>
                  </RecordCard>
                );
              })}
              {authorizedRecords.length === 0 && (
                <p>No authorized records available.</p>
              )}
            </RecordGrid>
          )}
        </RecordsCard>
      </ContentContainer>
    </DashboardWrapper>
  );
}
