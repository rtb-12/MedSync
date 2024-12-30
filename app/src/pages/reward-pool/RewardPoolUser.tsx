// src/pages/reward-pool/RewardPoolUser.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Button, Input } from '../../components/shared/Card';
import { LoadingState } from '../../components/shared/LoadingState';
import { useTheme } from '../../contexts/ThemeContext';
import { useContract } from '@starknet-react/core';
import { ABI } from '../../abi/Contract_ABI';
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
  status: 'pending' | 'accepted' | 'rejected';
}>`
  background: ${({ status }) =>
    status === 'accepted'
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

// Add a modal component for showing the entity ID
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

// Update interface to match API response
interface ResearchPool {
  created_at: number;
  description: string;
  entity_id: string;
  reward_amount: number;
  status: string;
  title: string;
}

const MOCK_PARTICIPATING_POOLS: ResearchPool[] = [
  {
    entity_id: 'pool_004',
    title: 'Diabetes Research',
    description: 'Analysis of diabetes treatment effectiveness',
    reward_amount: 350,
    status: 'accepted',
    created_at: 0,
  },
  {
    entity_id: 'pool_005',
    title: 'Mental Health Study',
    description: 'Research on anxiety and depression patterns',
    reward_amount: 250,
    status: 'pending',
    created_at: 0,
  },
  {
    entity_id: 'pool_006',
    title: 'Sleep Pattern Analysis',
    description: 'Study on sleep disorders and treatments',
    reward_amount: 200,
    status: 'rejected',
    created_at: 0,
  },
];

export function RewardPoolUser() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [availablePools, setAvailablePools] = useState<ResearchPool[]>([]);
  const [participatingPools, setParticipatingPools] = useState<ResearchPool[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<ResearchPool | null>(null);
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
        // Keep mock participating pools for now
        setParticipatingPools(MOCK_PARTICIPATING_POOLS);
      } catch (err) {
        console.error('Failed to fetch research pools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, []);

  const { contract } = useContract({
    address: '0x123...', // Your contract address
    abi: ABI,
  });

  const handleClaimReward = async (entityId: string) => {
    setIsLoading(true);
    try {
      // Call contract to claim reward
      await contract.invoke('withdraw_reward', [entityId]);
      // Update UI after successful claim
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCopyEntityId = (entityId: string) => {
    navigator.clipboard.writeText(entityId);
    // Optional: Add a toast or notification here
  };
  const handleParticipate = async (poolId: string) => {
    try {
      const pool = availablePools.find((p) => p.entity_id === poolId);
      if (pool) {
        setSelectedPool(pool);
        setShowModal(true);
        // Call API to submit to pool
        const result = await api.submitToPool(pool.entity_id);
        if (result.error) {
          throw new Error(result.error.message);
        }
        // Update UI after successful submission
        handleModalClose();
      }
    } catch (err) {
      console.error('Failed to participate:', err);
      alert('Failed to participate in pool');
    }
  };
  const handleModalClose = () => {
    if (selectedPool) {
      setParticipatingPools([
        ...participatingPools,
        { ...selectedPool, status: 'pending' },
      ]);
      setAvailablePools(availablePools.filter((p) => p.entity_id !== selectedPool.entity_id));
    }
    setShowModal(false);
    setSelectedPool(null);
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
          {participatingPools.map((pool) => (
            <ResearchCard key={pool.entity_id} theme={theme}>
              <h3>{pool.title}</h3>
              <p>{pool.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <RewardBadge theme={theme}>
                  Reward: {pool.reward_amount} USD
                </RewardBadge>
                <StatusBadge theme={theme} status={pool.status}>
                  {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                </StatusBadge>
              </div>
              {pool.claimable && (
                <StyledButton
                  variant="primary"
                  onClick={() => handleClaimReward(pool.entity_id)}
                >
                  Claim Reward
                </StyledButton>
              )}
            </ResearchCard>
          ))}
        </ResearchGrid>

        {showModal && selectedPool && (
          <>
            <Overlay onClick={handleModalClose} />
            <Modal theme={theme}>
              <h3>Research Pool ID</h3>
              <p>Copy this ID to provide to the researcher:</p>
              <EntityIdDisplay theme={theme}>
                <span>{selectedPool.entity_id}</span>
                <CopyButton
                  onClick={() => handleCopyEntityId(selectedPool.entity_id)}
                >
                  Copy ID
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
