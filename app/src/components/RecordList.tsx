import React, { useState } from 'react';
import { Card, Button } from './shared/Card';
import styled from 'styled-components';
import { PatientRecord } from '../types/HealthTypes';
import { useTheme } from '../contexts/ThemeContext';
import { HealthDataApi } from '../api/healthDataApi';

interface PatientRecord {
  data: string;  // This contains the JSON string of medical details
  timestamp: number;
  record_type: string;
  owner_id: string;
  authorized_ids: string[];
  is_anonymized: boolean;
}

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

interface Props {
  records: PatientRecord[];
  onDelete: (patientId: string) => void;
  onUpdate: (patientId: string, data: any, recordType: string) => void;
}

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
    .detail-section {
    margin: 1rem 0;
    padding: 0.75rem;
    background: ${({ theme }) => 
      theme === 'light' 
        ? 'rgba(0, 0, 0, 0.02)' 
        : 'rgba(255, 255, 255, 0.05)'};
    border-radius: 0.5rem;

    h5 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: ${({ theme }) => 
        theme === 'light' ? '#111111' : '#ffffff'};
    }

    ul {
      list-style: disc;
      margin-left: 1.5rem;
      
      li {
        margin: 0.25rem 0;
        color: ${({ theme }) => 
          theme === 'light' ? '#374151' : '#9ca3af'};
      }
    }

    p {
      color: ${({ theme }) => 
        theme === 'light' ? '#374151' : '#9ca3af'};
    }
  }
`;

export function RecordList({ records, onDelete, onUpdate }: Props) {
  const { theme } = useTheme();
  const api = new HealthDataApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const parseMedicalDetails = (data: string): MedicalDetails | null => {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse medical details:', err);
      return null;
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await api.deletePatientData(patientId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      onDelete(patientId);
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (record: PatientRecord) => {
    setIsUpdating(true);
    try {
      const medicalDetails = parseMedicalDetails(record.data);
      if (!medicalDetails) return;

      const data = new TextEncoder().encode(JSON.stringify(medicalDetails));
      const result = await api.updatePatientData(
        record.owner_id,
        data,
        record.record_type
      );

      if (result.error) {
        throw new Error(result.error.message);
      }
      onUpdate(record.owner_id, medicalDetails, record.record_type);
    } catch (err) {
      console.error('Failed to update record:', err);
      alert('Failed to update record');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card theme={theme}>
      <StyledHeading>Health Records</StyledHeading>
      <RecordGrid>
        {records.map((record) => {
          const medicalDetails = parseMedicalDetails(record.data);
          
          return (
            <RecordCard key={`${record.owner_id}-${record.timestamp}`} theme={theme}>
              <div className="record-header">
                <h4>{medicalDetails?.recordType || record.record_type}</h4>
              </div>
              
              <div className="record-details">
                {medicalDetails && (
                  <>
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

                    {medicalDetails.symptoms.length > 0 && (
                      <div className="detail-section">
                        <h5>Symptoms</h5>
                        <ul>
                          {medicalDetails.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
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
                      <h5>Visit Details</h5>
                      <p><strong>Date:</strong> {medicalDetails.date}</p>
                      {medicalDetails.doctorName && (
                        <p><strong>Doctor:</strong> {medicalDetails.doctorName}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="record-meta">
                <p><strong>Created:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> {record.is_anonymized ? 'Anonymized' : 'Private'}</p>
                {record.authorized_ids.length > 0 && (
                  <p><strong>Authorized Users:</strong> {record.authorized_ids.join(', ')}</p>
                )}
              </div>

              <div className="record-actions">
                <Button 
                  onClick={() => handleUpdate(record)}
                  disabled={isUpdating}
                  style={{ marginRight: '1rem' }}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
                <Button 
                  onClick={() => handleDelete(record.owner_id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </RecordCard>
          );
        })}
        
        {records.length === 0 && (
          <p className={`text-center ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            No health records found.
          </p>
        )}
      </RecordGrid>
    </Card>
  );
}