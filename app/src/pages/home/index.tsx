import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,  
  getAppEndpointKey,
  getRefreshToken,
} from '@calimero-network/calimero-client';
import { getStorageApplicationId } from '../../utils/node';
import { clearApplicationId } from '../../utils/storage';

const Container = styled.div<{ theme: 'light' | 'dark' }>`
  min-height: 100vh;
  width: 100%;
  background: ${({ theme }) => 
    theme === 'light'
      ? 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)'
      : 'linear-gradient(135deg, #111827 0%, #111111 50%, #111827 100%)'};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  transition: all 0.3s ease;
`;

const Content = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  text-align: center;
  position: relative;
`;

const GradientBackground = styled.div<{ theme: 'light' | 'dark' }>`
  position: absolute;
  inset: 0;
  background: ${({ theme }) =>
    theme === 'light'
      ? 'linear-gradient(to right, rgba(59,130,246,0.05), rgba(168,85,247,0.05), rgba(236,72,153,0.05))'
      : 'linear-gradient(to right, rgba(59,130,246,0.1), rgba(168,85,247,0.1), rgba(236,72,153,0.1))'};
  filter: blur(24px);
  animation: gradient 15s ease infinite;
`;

const ContentInner = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: bold;
  background: linear-gradient(to right, #60a5fa, #a855f7, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: text 5s ease infinite;
`;

const Description = styled.p<{ theme: 'light' | 'dark' }>`
  font-size: 1.25rem;
  color: ${({ theme }) => theme === 'light' ? '#4b5563' : '#d1d5db'};
  max-width: 42rem;
  margin: 0 auto;
  line-height: 1.75;
  transition: all 0.3s ease;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr;
  gap: 1.5rem;
  margin-top: 3rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PortalButton = styled.button`
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  padding: 0.125rem;
  background: ${props => props.variant === 'hospital' ? 
    'linear-gradient(135deg, #9333ea, #db2777)' : 
    'linear-gradient(135deg, #3b82f6, #9333ea)'};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }
`;

const ButtonContent = styled.div<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => theme === 'light' ? '#ffffff' : '#111111'};
  border-radius: 0.75rem;
  padding: 1.5rem 2rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => 
      theme === 'light' 
        ? 'rgba(255,255,255,0.9)' 
        : 'rgba(17,17,17,0.9)'};
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme === 'light' ? '#111111' : 'white'};
  }

  p {
    color: ${({ theme }) => theme === 'light' ? '#6b7280' : '#9ca3af'};
  }
`;
const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 4rem;
  
  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
const FeatureCard = styled.div<{ theme: 'light' | 'dark' }>`
  background: ${({ theme }) => theme === 'light' ? '#ffffff' : '#1f2937'};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) =>
    theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    color: ${({ theme }) => theme === 'light' ? '#111111' : '#ffffff'};
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    background: linear-gradient(to right, #60a5fa, #a855f7);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  p {
    color: ${({ theme }) => theme === 'light' ? '#4b5563' : '#9ca3af'};
    line-height: 1.6;
  }
`;

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;


export default function HomePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const url = getAppEndpointKey();
  const applicationId = getStorageApplicationId();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  useEffect(() => {
    if (!url || !applicationId || !accessToken || !refreshToken) {
      navigate('/auth');
    }
  }, [accessToken, applicationId, navigate, refreshToken, url]);

  const logout = () => {
    clearAppEndpoint();
    clearJWT();
    clearApplicationId();
    navigate('/auth');
  };

  return (
    <Container theme={theme}>
      <Content>
        <GradientBackground theme={theme} />
        <ContentInner>
          <Title>MedSync Platform</Title>
          <Description theme={theme}>
            A decentralized healthcare data management system powered by Starknet and Calimero, 
            ensuring security, privacy, and seamless interoperability in healthcare data sharing.
          </Description>
  
          <FeatureGrid>
            <FeatureCard theme={theme}>
              <Icon>🔐</Icon>
              <h3>Decentralized Consent</h3>
              <p>Grant or revoke data access permissions with verifiable proofs ensuring authenticity.</p>
            </FeatureCard>
  
            <FeatureCard theme={theme}>
              <Icon>📊</Icon>
              <h3>Data Access Logging</h3>
              <p>Track and audit all data access requests with complete transparency.</p>
            </FeatureCard>
  
            <FeatureCard theme={theme}>
              <Icon>💎</Icon>
              <h3>Reward Mechanism</h3>
              <p>Earn rewards for sharing medical data with research institutions.</p>
            </FeatureCard>
  
            <FeatureCard theme={theme}>
              <Icon>🛡️</Icon>
              <h3>Zero-Knowledge Proofs</h3>
              <p>Validate consent without exposing sensitive information, ensuring GDPR compliance.</p>
            </FeatureCard>
  
            <FeatureCard theme={theme}>
              <Icon>⚡</Icon>
              <h3>Starknet-Powered</h3>
              <p>Fast, secure, and low-cost transactions with L2 blockchain technology.</p>
            </FeatureCard>
  
            <FeatureCard theme={theme}>
              <Icon>🔒</Icon>
              <h3>Private Network</h3>
              <p>Secure operations on Calimero nodes for sensitive medical data.</p>
            </FeatureCard>
          </FeatureGrid>
        </ContentInner>
      </Content>
    </Container>
  );
}