import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { LoadingState } from '../../components/shared/LoadingState';
import { useTheme } from '../../contexts/ThemeContext';
import { useContract, useSendTransaction, useTransactionReceipt } from '@starknet-react/core';
import { ABI } from '../../abi/Contract_ABI';
import { HealthDataApi } from '../../api/healthDataApi';
import { type Abi } from 'starknet';

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

const ResearchGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  margin-top: 2rem;
`;

const ResearchCard = styled(Card)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => (theme === 'light' ? '#ffffff' : '#1f2937')};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
  }
`;

const RewardBadge = styled.span<{ theme: 'light' | 'dark' }>`
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const StatusBadge = styled.span<{
  theme: 'light' | 'dark';
  status: string;
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

const StyledButton = styled(Button)<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant }) =>
    variant === 'primary'
      ? 'linear-gradient(135deg, #3b82f6, #9333ea)'
      : 'transparent'};
  color: ${({ variant }) => (variant === 'primary' ? '#ffffff' : 'inherit')};
  width: 100%;
  margin-top: 1rem;
`;

const Modal = styled.div<{ theme: 'light' | 'dark' }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => 
    theme === 'light' ? '#ffffff' : '#1f2937'};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  z-index: 1000;
  border: 1px solid ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
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

const EntityIdDisplay = styled.div<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) =>
    theme === 'light' ? '#f8fafc' : '#111827'};
  padding: 0.75rem;
  border-radius: 6px;
  font-family: monospace;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
`;

const CopyButton = styled(Button)`
  padding: 0.5rem;
  min-width: 100px;
`;

interface ResearchPool {
  created_at: number;
  description: string;
  entity_id: string;
  reward_amount: number;
  status: string;
  title: string;
}

interface PoolSubmission {
  patient_id: string;
  entity_id: string;
  submitted_at: number;
  status: string;
}



const contractAddress = '0x01fef8db26d72596018cb1783bb856123099b1a8efac4454c7976171612d0dba';

export function RewardPoolUser() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [availablePools, setAvailablePools] = useState<ResearchPool[]>([]);
  const [participatingPools, setParticipatingPools] = useState<ResearchPool[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<ResearchPool | null>(null);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [participatingLoading, setParticipatingLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState<ResearchPool | null>(null);
  const api = new HealthDataApi();

  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true);
      try {
        const result = await api.listResearchPools();
        if (result.data) {
          // Format pools data
          const formattedPools = result.data.map(pool => ({
            ...pool,
            created_at: Number(pool.created_at) / 1000000, // Convert nanoseconds to milliseconds
          }));
          setAvailablePools(formattedPools);
        }

      } catch (err) {
        console.error('Failed to fetch research pools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, []);

  useEffect(() => {
    const fetchParticipatingPools = async () => {
      setParticipatingLoading(true);
      try {
        const result = await api.getPatientSubmissions();
        if (result.data) {
          const participatingPoolsData = result.data.map(submission => ({
            entity_id: submission.entity_id,
            title: availablePools.find(p => p.entity_id === submission.entity_id)?.title || 'Unknown Pool',
            description: availablePools.find(p => p.entity_id === submission.entity_id)?.description || '',
            reward_amount: availablePools.find(p => p.entity_id === submission.entity_id)?.reward_amount || 0,
            status: submission.status,
            created_at: submission.submitted_at,
          }));
          setParticipatingPools(participatingPoolsData);
        }
      } catch (err) {
        console.error('Failed to fetch participating pools:', err);
      } finally {
        setParticipatingLoading(false);
      }
    };

    fetchParticipatingPools();
  }, [availablePools]);
  const truncateForContract = (id: string): string => {
    return id.substring(0, 31);
  };
  const { contract } = useContract({
    address: contractAddress,
    abi: ABI as Abi, 
  });

  const calls = useMemo(() => {
    if (!contract || !selectedReward) return [];

    // Convert reward amount to u256 compatible value
    const amount = BigInt(Math.floor(selectedReward.reward_amount));

    const truncatedId = truncateForContract(selectedReward.entity_id);

  return [contract.populate('withdraw_reward', [
    truncatedId,
    amount
  ])];
  }, [contract, selectedReward]);

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
  } = useTransactionReceipt({
    hash: writeData?.transaction_hash,
    watch: true,
  });

  const handleClaimReward = async (entityId: string) => {
    console.log('=== Claiming Reward ===');
    console.log('Entity ID:', entityId);
    
    setIsLoading(true);
    try {
      const pool = participatingPools.find(p => p.entity_id === entityId);
      console.log('Selected Pool:', pool);
      
      if (!pool) {
        throw new Error('Pool not found');
      }

      setSelectedReward(pool);
      console.log('Reward Amount:', pool.reward_amount);
      console.log('Contract Status:', contract ? 'Loaded' : 'Not Loaded');
      
      // Trigger transaction
      console.log('Initiating Transaction...');
      const tx = writeAsync();
      console.log('Transaction Data:', tx);
      
      if (waitData?.transaction_hash) {
        console.log('Transaction Hash:', waitData.transaction_hash);
        console.log('Transaction Status:', waitStatus);
        alert('Reward claimed successfully!');
      }

    } catch (error) {
      console.error('Claim Reward Error:', error);
      console.error('Error Details:', {
        contract: !!contract,
        selectedReward: !!selectedReward,
        isPending: writeIsPending,
        waitStatus
      });
      alert('Failed to claim reward. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedReward(null);
    }
  };

  const handleCopyEntityId = (entityId: string) => {
    navigator.clipboard.writeText(entityId);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };
  const handleParticipate = (poolId: string) => {
    const pool = availablePools.find((p) => p.entity_id === poolId);
    if (pool) {
      setSelectedPool(pool);
      setShowModal(true);
    }
  };
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPool(null);
  };

  const formatEntityId = (id: string) => {
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-6)}`;
  };

  return (
    <DashboardWrapper theme={theme}>
      <ContentContainer>
        <h2>Available Research Pools</h2>
        <ResearchGrid>
          {isLoading ? (
            <LoadingState />
          ) : (
            availablePools.map((pool) => (
              <ResearchCard key={pool.entity_id} theme={theme}>
                <h3>{pool.title}</h3>
                <p>{pool.description}</p>
                <RewardBadge theme={theme}>
                  Reward: {pool.reward_amount} STARK
                </RewardBadge>
                <StyledButton
                  variant="primary"
                  onClick={() => handleParticipate(pool.entity_id)}
                >
                  Participate
                </StyledButton>
              </ResearchCard>
            ))
          )}
        </ResearchGrid>

        <h2>Your Participating Research</h2>
        <ResearchGrid>
          {participatingLoading ? (
            <LoadingState />
          ) : (
            participatingPools.map((pool) => (
              <ResearchCard key={pool.entity_id} theme={theme}>
                <h3>{pool.title}</h3>
                <p>{pool.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <RewardBadge theme={theme}>
                    Reward: {pool.reward_amount} STARK
                  </RewardBadge>
                  <StatusBadge theme={theme} status={pool.status.toLowerCase()}>
                    {pool.status.charAt(0).toUpperCase() + pool.status.slice(1).toLowerCase()}
                  </StatusBadge>
                </div>
                {pool.status.toLowerCase() === 'approved' && (
                  <StyledButton
                    variant="primary"
                    onClick={() => handleClaimReward(pool.entity_id)}
                    disabled={isLoading || writeIsPending || waitIsLoading}
                  >
                    {isLoading || writeIsPending ? 'Processing...' : 
                     waitIsLoading ? 'Confirming...' : 
                     'Claim Reward'}
                  </StyledButton>
                )}
              </ResearchCard>
            ))
          )}
        </ResearchGrid>

        {showModal && selectedPool && (
          <>
            <Overlay onClick={handleModalClose} />
            <Modal theme={theme}>
              <h3>Research Pool ID</h3>
              <p>Copy this ID to provide to the researcher:</p>
              <EntityIdDisplay theme={theme}>
                <span title={selectedPool.entity_id}>
                  {formatEntityId(selectedPool.entity_id)}
                </span>
                <CopyButton
                  onClick={() => handleCopyEntityId(selectedPool.entity_id)}
                  style={{ 
                    background: copyStatus === 'Copied!' ? '#10B981' : '#3b82f6',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {copyStatus}
                </CopyButton>
              </EntityIdDisplay>
              <StyledButton
                variant="primary"
                onClick={handleModalClose}
              >
                Continue
              </StyledButton>
            </Modal>
          </>
        )}
      </ContentContainer>
    </DashboardWrapper>
  );
}
