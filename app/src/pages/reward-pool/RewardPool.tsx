// src/pages/reward-pool/RewardPool.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RewardPoolCreator } from './RewardPoolCreator';
import { RewardPoolUser } from './RewardPoolUser';

export function RewardPool() {
  const { userRole } = useAuth();

  // Show different interfaces based on user role
  if (userRole === 'researcher') {
    return <RewardPoolCreator />;
  }

  // Default to user view for patients
  return <RewardPoolUser />;
}