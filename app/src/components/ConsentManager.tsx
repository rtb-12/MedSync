import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input } from '../components/shared/Card';
import styled from 'styled-components';
import { HealthDataApi } from '../api/healthDataApi';
import { useTheme } from '../contexts/ThemeContext';
import { generateConsentProof } from '../utils/ProofGeneration';
import {  getJWTObject } from '../utils/storage';
import { ABI } from '../abi/Contract_ABI';
import { type Abi } from 'starknet';
import {
  useContract,
  useTransactionReceipt,
  useSendTransaction,
} from '@starknet-react/core';

const StyledCard = styled(Card)`
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

const ConsentList = styled.div`
  margin-top: 1.5rem;
`;

const ConsentItem = styled.div<{ theme: 'light' | 'dark' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 17, 17, 0.8)'};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px
      ${({ theme }) =>
        theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  }

  span {
    color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const StyledInput = styled(Input)<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) =>
    theme === 'light' ? '#f8fafc' : 'rgba(17, 17, 17, 0.8)'};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }
`;

const ProofSection = styled.div<{ theme: 'light' | 'dark' }>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'};
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Toggle = styled.div<{ active: boolean; theme: 'light' | 'dark' }>`
  width: 48px;
  height: 24px;
  background: ${({ active }) =>
    active ? 'linear-gradient(135deg, #3b82f6, #9333ea)' : '#6b7280'};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => (active ? '26px' : '2px')};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const ProofStatus = styled.div<{ 
  status: 'none' | 'generating' | 'ready'; 
  theme: 'light' | 'dark' 
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme, status }) => {
    if (status === 'ready') return '#10B981';
    return theme === 'light' ? '#111111' : '#ffffff';
  }};
`;

// Add new styled component for toggle text
const ToggleText = styled.span<{ theme: 'light' | 'dark' }>`
  color: ${({ theme }) => theme === 'light' ? '#111111' : '#ffffff'};
`;

// Add consent reasons
const CONSENT_REASONS = {
  HOSPITAL: 'hospital_access',
  RESEARCH: 'research_access',
  OTHER: 'other_access'
} as const;

// Add styled dropdown
const StyledSelect = styled.select<{ theme: 'light' | 'dark' }>`
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: ${({ theme }) =>
    theme === 'light' ? '#f8fafc' : 'rgba(17, 17, 17, 0.8)'};
  border: 1px solid
    ${({ theme }) =>
      theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme }) => (theme === 'light' ? '#111111' : '#ffffff')};
  width: 200px;
`;

// Add new styled components
const TransactionStatus = styled.div<{ status: string; theme: 'light' | 'dark' }>`
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  text-align: center;
  background: ${({ status }) => {
    switch (status) {
      case 'pending': return '#FEF3C7';
      case 'success': return '#D1FAE5';
      case 'error': return '#FEE2E2';
      default: return 'transparent';
    }
  }};
`;

export function ConsentManager() {
  const [entityId, setEntityId] = useState('');
  const [consents, setConsents] = useState<string[]>([]);
  const { theme } = useTheme();
  const api = new HealthDataApi();
  const [useProof, setUseProof] = useState(false);
  const [proofStatus, setProofStatus] = useState<'none' | 'generating' | 'ready'>('none');
  const [proofData, setProofData] = useState<{proof: string, timestamp: number} | null>(null);
  const jwtObject = getJWTObject();
  const [reason, setReason] = useState<typeof CONSENT_REASONS[keyof typeof CONSENT_REASONS]>(CONSENT_REASONS.HOSPITAL);
  const [txStatus, setTxStatus] = useState<'none' | 'pending' | 'success' | 'error'>('none');
  const truncateToShortString = (str: string): string => {
    return str.length > 31 ? str.substring(0, 31) : str;
  };

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
  
      const calls = useMemo(() => {
        if (!contract || !proofData) return [];
      
        const shortPatientId = truncateToShortString(jwtObject?.executor_public_key || '');
        const shortEntityId = truncateToShortString(entityId);
        const shortReason = truncateToShortString(reason);
        const shortProof = truncateToShortString(proofData.proof);
      
        // Format expiration as enum variant with tagged union format
        const expiration = [
          'Finite', // Variant name as first element
          BigInt(proofData.timestamp + (90 * 24 * 60 * 60)) // Variant value as second element
        ];
      
        return [
          contract.populate('add_consent_proof', [
            shortPatientId,
            shortEntityId, 
            shortReason,
            shortProof,
            expiration
          ])
        ];
      }, [contract, proofData, entityId, reason, jwtObject]);
    
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
  

  async function generateProof() {
    try {
      setProofStatus('generating');
      const patientId = jwtObject?.executor_public_key; // Get logged in patient ID
      if (!patientId) {
        throw new Error('Patient ID not found');
      }
      const data = await generateConsentProof(
        patientId,
        entityId,
        reason // Use selected reason
      );
      setProofData(data);
      console.log('Proof data:', data);
      setProofStatus('ready');
      api.addConsent(entityId, reason, data.proof);
      // Auto-trigger transaction
      try {
        setTxStatus('pending');
        await writeAsync();
        setTxStatus('success');
      } catch (err) {
        console.error('Transaction failed:', err);
        setTxStatus('error');
      }

    } catch (err) {
      console.error('Failed to generate proof:', err);
      setProofStatus('none');
      alert('Failed to generate proof');
    }
  }

  async function handleRevokeConsent(id: string) {
    try {
      await api.revokeAccess(id);
      setConsents(consents.filter((c) => c !== id));
    } catch (err) {
      console.error('Failed to revoke consent:', err);
      alert('Failed to revoke consent');
    }
  }

  return (
    <StyledCard theme={theme}>
      <h3>Manage Data Access</h3>
      <InputWrapper>
        <StyledInput
          theme={theme}
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Enter hospital/researcher ID"
        />
        <StyledSelect
          theme={theme}
          value={reason}
          onChange={(e) => setReason(e.target.value as typeof reason)}
        >
          <option value={CONSENT_REASONS.HOSPITAL}>Hospital Access</option>
          <option value={CONSENT_REASONS.RESEARCH}>Research Access</option>
          <option value={CONSENT_REASONS.OTHER}>Other</option>
        </StyledSelect>
      </InputWrapper>

      <ProofSection theme={theme}>
        {/* Remove toggle, always require proof */}
        <Button 
          onClick={generateProof}
          disabled={proofStatus === 'generating' || txStatus === 'pending'}
        >
          {proofStatus === 'generating' ? 'Generating Proof...' : 
           txStatus === 'pending' ? 'Confirming Transaction...' : 
           'Generate Proof & Grant Access'}
        </Button>

        <ProofStatus status={proofStatus} theme={theme}>
          {proofStatus === 'generating' && '⏳ Generating proof...'}
          {proofStatus === 'ready' && '✓ Proof generated'}
        </ProofStatus>

        {txStatus !== 'none' && (
          <TransactionStatus status={txStatus} theme={theme}>
            {txStatus === 'pending' && '⏳ Confirming transaction...'}
            {txStatus === 'success' && '✅ Access granted successfully!'}
            {txStatus === 'error' && '❌ Transaction failed. Please try again.'}
          </TransactionStatus>
        )}
      </ProofSection>

      <ConsentList>
        {consents.map((id) => (
          <ConsentItem key={id} theme={theme}>
            <span>{id}</span>
            <Button className="warning" onClick={() => handleRevokeConsent(id)}>
              Revoke
            </Button>
          </ConsentItem>
        ))}
      </ConsentList>
    </StyledCard>
  );
}
