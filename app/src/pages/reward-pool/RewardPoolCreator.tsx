// src/pages/reward-pool/RewardPoolCreator.tsx
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { LoadingState } from '../../components/shared/LoadingState';
import { useTheme } from '../../contexts/ThemeContext';
import { PatientRecord } from '../../types/HealthTypes';
import { ABI } from '../../abi/Contract_ABI';
import { type Abi } from 'starknet';
import {
  useContract,
  useTransactionReceipt,
  useSendTransaction,
} from '@starknet-react/core';
import { HealthDataApi } from '../../api/healthDataApi';

const DashboardWrapper = styled.div<{ theme: 'light' | 'dark' }>`
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: ${({ theme }) => (theme === 'light' ? '#f8fafc' : '#1a1b23')};
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
`;

const FormCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => (theme === 'light' ? '#ffffff' : '#1f2937')};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SubmissionsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const SubmissionCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => (theme === 'light' ? '#ffffff' : '#1f2937')};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const StatusBadge = styled.span<{
  theme: 'light' | 'dark';
  status: 'pending' | 'approved' | 'rejected';
}>`
  background: ${({ status }) =>
    status === 'approved'
      ? '#10B981'
      : status === 'rejected'
        ? '#EF4444'
        : '#F59E0B'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ReportModal = styled.div<{ theme: 'light' | 'dark' }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => (theme === 'light' ? '#ffffff' : '#1f2937')};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
  z-index: 1000;
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  max-height: 80vh;
  overflow-y: auto;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ReportsSection = styled.div`
  margin-top: 2rem;
`;

const ReportCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  margin-bottom: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 1rem 0;
`;

const ReportField = styled.div`
  margin-bottom: 1rem;

  h4 {
    font-size: 0.875rem;
    color: ${({ theme }) => (theme === 'light' ? '#6B7280' : '#9CA3AF')};
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 1rem;
    color: ${({ theme }) => (theme === 'light' ? '#111827' : '#F3F4F6')};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const DeleteButton = styled(Button)`
  background: #EF4444;
  color: white;
  &:hover {
    background: #DC2626;
  }
`;

const ConfirmDialog = styled(ReportModal)`
  max-width: 400px;
`;

interface ResearchSubmission {
  patientId: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  dataHash: string;
}

interface ResearchPool {
  title: string;
  description: string;
  reward_amount: number;
  entity_id: string;
  created_at: number;
  status: string;
}
interface PatientReport {
  diagnosis: string;
  medications: string[];
  testResults: string[];
  notes: string;
}

export function RewardPoolCreator() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [pools, setPools] = useState<ResearchPool[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<PatientRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<PatientRecord | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = new HealthDataApi();
  const contractAddress =
    '0x064fc926e3d3cc3c471b407704d867aa838aa0d3881415c7977b966b2db82d2d';
  const { contract } = useContract({
    address: contractAddress,
    abi: ABI as Abi,
  });
  useEffect(() => {
    console.log('Contract address:', contractAddress);
    console.log('Contract instance:', contract);
  }, [contract, contractAddress]);
  const MAX_U256 = BigInt(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  );

  const calls = useMemo(() => {
    if (!contract || !rewardAmount) return [];

    // Create entity ID from title and timestamp
    const entityId = BigInt(
      '0x' + Buffer.from(title + Date.now().toString()).toString('hex'),
    );

    // Convert to u256 compatible value
    const amount = BigInt(Math.floor(parseFloat(rewardAmount)));

    // Validate u256 range
    if (amount < 0 || amount > MAX_U256) {
      console.error('Amount out of u256 range');
      return [];
    }

    console.log('Amount as u256:', amount.toString());

    return [contract.populate('deposit_reward', [entityId, amount])];
  }, [contract, title, rewardAmount]);

  const {
    send: writeAsync,
    data: writeData,
    isPending: writeIsPending,
  } = useSendTransaction({
    calls,
  });

  const {
    data: waitData,
    status: waitStatus,
    isLoading: waitIsLoading,
    isError: waitIsError,
    error: waitError,
  } = useTransactionReceipt({
    hash: writeData?.transaction_hash,
    watch: true,
  });

  useEffect(() => {
    const fetchReports = async () => {
      setIsReportLoading(true);
      try {
        const result = await api.listAuthorizedReports();
        if (result.data) {
          setReports(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setIsReportLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleViewReport = (report: PatientRecord) => {
    setSelectedReport(report);
    setShowReport(true);
  };

  const LoadingState = ({ message }: { message: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ animation: 'spin 1s linear infinite' }}>⌛</div>
      <span>{message}</span>
    </div>
  );

  // Button content handler
  const buttonContent = () => {
    if (writeIsPending) {
      return <LoadingState message="Creating pool..." />;
    }

    if (waitIsLoading) {
      return <LoadingState message="Waiting for confirmation..." />;
    }

    if (waitStatus === 'error') {
      return 'Transaction failed';
    }

    if (waitStatus === 'success') {
      return 'Pool created successfully!';
    }

    return 'Create Pool';
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardAmount || !title || !description) {
      return;
    }

    try {
      setIsSubmitting(true);
      await writeAsync();
    } catch (error) {
      console.error('Failed to create pool:', error);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleSuccessfulTransaction = async () => {
      if (waitStatus === 'success' && isSubmitting) {
        try {
          const result = await api.createResearchPool(
            title,
            description,
            parseFloat(rewardAmount)
          );

          if (result.error) {
            console.error('Failed to store pool details:', result.error);
            return;
          }

          // Reset form and state
          setTitle('');
          setDescription('');
          setRewardAmount('');
          setIsSubmitting(false);
          
          // Refresh pools list
          fetchPools();
        } catch (error) {
          console.error('Failed to create pool:', error);
        }
      }
    };

    handleSuccessfulTransaction();
  }, [waitStatus, isSubmitting]);

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      const result = await api.getResearchPool();
      if (result.data) {
        setPools([result.data]); // API returns single pool, wrap in array
      }
    } catch (err) {
      console.error('Failed to fetch pools:', err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPools();
  }, []);

  const handleApproveReport = async (patientId: string) => {
    try {
      setIsLoading(true);
      await api.updateSubmissionStatus(pools[0].entity_id, patientId, "approved");
      setShowReport(false);
      // Show success message
      alert('Report approved successfully!');
    } catch (err) {
      console.error('Failed to approve report:', err);
      alert('Failed to approve report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePool = (entityId: string) => {
    console.log('Deleting pool:', entityId); // Add debug log
    setPoolToDelete(entityId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!poolToDelete) return;
    
    try {
      setIsDeleting(true);
      const result = await api.deleteResearchPool(poolToDelete);
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Remove pool from state
      setPools(pools.filter(p => p.entity_id !== poolToDelete));
      setShowDeleteConfirm(false);
      
    } catch (err) {
      console.error('Failed to delete pool:', err);
      alert('Failed to delete research pool');
    } finally {
      setIsDeleting(false);
      setPoolToDelete(null);
    }
  };

  return (
    <DashboardWrapper theme={theme}>
      <ContentContainer>
        <FormCard theme={theme}>
          <h3>Create New Research Pool</h3>
          <Form onSubmit={handleCreatePool}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Research Title"
              required
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Research Description"
              required
              as="textarea"
              rows={4}
            />
            <Input
              value={rewardAmount}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setRewardAmount(e.target.value);
                }
              }}
              placeholder="Amount (as whole number)"
              type="number"
              min="0"
              step="1"
              required
            />
            <Button
              variant="primary"
              type="submit"
              disabled={writeIsPending || waitIsLoading}
            >
              {buttonContent()}
            </Button>

            {waitIsError && (
              <div style={{ color: 'red', marginTop: '1rem' }}>
                Transaction failed: {waitError?.message}
              </div>
            )}
          </Form>
        </FormCard>
        {isLoading ? (
          <LoadingState message="Loading pools..." />
        ) : (
          pools.map((pool) => (
            <FormCard key={pool.entity_id} theme={theme}>
              <h3>{pool.title}</h3>
              <p>{pool.description}</p>
              <p>Reward: {pool.reward_amount} STARK</p>
              <p>Status: {pool.status}</p>
              <p>Created: {new Date(pool.created_at).toLocaleString()}</p>
              
              <ButtonGroup>
                <DeleteButton
                  onClick={() => handleDeletePool(pool.entity_id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Pool'}
                </DeleteButton>
              </ButtonGroup>
            </FormCard>
          ))
        )}

        {!isLoading && pools.length === 0 && (
          <p>No research pools found. Create one to get started!</p>
        )}

<ReportsSection>
          <h3>Submitted Reports</h3>
          {isReportLoading ? (
            <LoadingState message="Loading reports..." />
          ) : (
            <ReportGrid>
              {reports.map((report, index) => (
                <ReportCard 
                  key={index} 
                  theme={theme}
                  onClick={() => handleViewReport(report)}
                >
                  <h4>Report Type: {report.record_type}</h4>
                  <p>Owner: {report.owner_id}</p>
                  <p>Submitted: {new Date(report.timestamp).toLocaleString()}</p>
                </ReportCard>
              ))}
            </ReportGrid>
          )}
        </ReportsSection>

        {showReport && selectedReport && (
          <>
            <Overlay onClick={() => setShowReport(false)} />
            <ReportModal theme={theme}>
              <h3>Report Details</h3>
              
              <ReportGrid>
                {(() => {
                  const data = JSON.parse(selectedReport.data);
                  return (
                    <>
                      <ReportField>
                        <h4>Record Type</h4>
                        <p>{data.recordType || 'Not specified'}</p>
                      </ReportField>
                      
                      <ReportField>
                        <h4>Diagnosis</h4>
                        <p>{data.diagnosis || 'None'}</p>
                      </ReportField>

                      <ReportField>
                        <h4>Date</h4>
                        <p>{data.date || 'Not specified'}</p>
                      </ReportField>

                      <ReportField>
                        <h4>Notes</h4>
                        <p>{data.notes || 'No notes'}</p>
                      </ReportField>

                      {data.medications?.length > 0 && (
                        <ReportField>
                          <h4>Medications</h4>
                          <p>{data.medications.join(', ')}</p>
                        </ReportField>
                      )}

                      {data.testResults?.length > 0 && (
                        <ReportField>
                          <h4>Test Results</h4>
                          <p>{data.testResults.join(', ')}</p>
                        </ReportField>
                      )}
                    </>
                  );
                })()}
              </ReportGrid>

              <ButtonGroup>
                <Button 
                  onClick={() => handleApproveReport(selectedReport.owner_id)}
                  variant="primary"
                >
                  Approve for Research Pool
                </Button>
                <Button 
                  onClick={() => setShowReport(false)}
                  variant="secondary"
                >
                  Close
                </Button>
              </ButtonGroup>
            </ReportModal>
          </>
        )}

        {showDeleteConfirm && poolToDelete && (
          <>
            <Overlay onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
            <ConfirmDialog theme={theme}>
              <h3>Delete Research Pool?</h3>
              <p>This action cannot be undone.</p>
              
              <ButtonGroup>
                <DeleteButton
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </DeleteButton>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </ConfirmDialog>
          </>
        )}
      </ContentContainer>
    </DashboardWrapper>
  );
}

