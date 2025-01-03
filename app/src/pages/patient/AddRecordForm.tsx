import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { HealthDataApi } from '../../api/healthDataApi';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  onRecordAdded: () => void;
}

interface HealthRecordDetails {
  diagnosis: string;
  medications: string[];
  testResults: string[];
  notes: string;
  symptoms: string[];
  recordType: string;
  date: string;
  doctorName: string;
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

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<{ theme: 'light' | 'dark' }>`
  color: ${({ theme }) => theme === 'light' ? '#374151' : '#e5e7eb'};
  font-size: 0.875rem;
  font-weight: 500;
`;

const TextArea = styled(StyledInput).attrs({ as: 'textarea' })`
  min-height: 100px;
  resize: vertical;
`;

const TagInput = styled(StyledInput)`
  &::placeholder {
    color: ${({ theme }) => theme === 'light' ? '#9ca3af' : '#6b7280'};
  }
`;

export function AddRecordForm({ onRecordAdded }: Props) {
  const [recordDetails, setRecordDetails] = useState<HealthRecordDetails>({
    diagnosis: '',
    medications: [],
    testResults: [],
    notes: '',
    symptoms: [],
    recordType: '',
    date: new Date().toISOString().split('T')[0],
    doctorName: ''
  });
  const [tempMedication, setTempMedication] = useState('');
  const [tempSymptom, setTempSymptom] = useState('');
  const [tempTestResult, setTempTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const api = new HealthDataApi();

  const handleAddItem = (field: keyof HealthRecordDetails, value: string) => {
    if (!value.trim()) return;
    
    setRecordDetails(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? [...prev[field], value] : prev[field]
    }));
  };

  const handleRemoveItem = (field: keyof HealthRecordDetails, index: number) => {
    setRecordDetails(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) 
        ? prev[field].filter((_, i) => i !== index) 
        : prev[field]
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const jsonData = JSON.stringify(recordDetails);
      const result = await api.storePatientData(
        new TextEncoder().encode(jsonData),
        recordDetails.recordType
      );

      if (result.error) {
        alert(result.error.message);
        return;
      }

      // Reset form
      setRecordDetails({
        diagnosis: '',
        medications: [],
        testResults: [],
        notes: '',
        symptoms: [],
        recordType: '',
        date: new Date().toISOString().split('T')[0],
        doctorName: ''
      });
      onRecordAdded();
    } catch (err) {
      console.error('Failed to add record:', err);
      alert('Failed to add record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard theme={theme}>
      <h3>Add New Health Record</h3>
      <form onSubmit={handleSubmit}>
        <InputGrid>
          <InputGroup>
            <Label theme={theme}>Record Type</Label>
            <StyledInput
              theme={theme}
              value={recordDetails.recordType}
              onChange={(e) => setRecordDetails(prev => ({ ...prev, recordType: e.target.value }))}
              placeholder="e.g., Blood Test, X-Ray"
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label theme={theme}>Date</Label>
            <StyledInput
              theme={theme}
              type="date"
              value={recordDetails.date}
              onChange={(e) => setRecordDetails(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </InputGroup>
        </InputGrid>

        <InputGroup>
          <Label theme={theme}>Diagnosis</Label>
          <TextArea
            theme={theme}
            value={recordDetails.diagnosis}
            onChange={(e) => setRecordDetails(prev => ({ ...prev, diagnosis: e.target.value }))}
            placeholder="Enter diagnosis details"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label theme={theme}>Medications</Label>
          <div>
            <TagInput
              theme={theme}
              value={tempMedication}
              onChange={(e) => setTempMedication(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem('medications', tempMedication);
                  setTempMedication('');
                }
              }}
              placeholder="Type medication and press Enter"
            />
            {recordDetails.medications.map((med, index) => (
              <Button
                key={index}
                onClick={() => handleRemoveItem('medications', index)}
                type="button"
              >
                {med} ×
              </Button>
            ))}
          </div>
        </InputGroup>

        <InputGroup>
          <Label theme={theme}>Test Results</Label>
          <div>
            <TagInput
              theme={theme}
              value={tempTestResult}
              onChange={(e) => setTempTestResult(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem('testResults', tempTestResult);
                  setTempTestResult('');
                }
              }}
              placeholder="Type test result and press Enter"
            />
            {recordDetails.testResults.map((result, index) => (
              <Button
                key={index}
                onClick={() => handleRemoveItem('testResults', index)}
                type="button"
              >
                {result} ×
              </Button>
            ))}
          </div>
        </InputGroup>

        <InputGroup>
          <Label theme={theme}>Notes</Label>
          <TextArea
            theme={theme}
            value={recordDetails.notes}
            onChange={(e) => setRecordDetails(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes"
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Record'}
        </SubmitButton>
      </form>
    </FormCard>
  );
}