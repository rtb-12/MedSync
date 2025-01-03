
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RewardPoolCreator } from './RewardPoolCreator';
import { RewardPoolUser } from './RewardPoolUser';

export function RewardPool() {
  const { userRole } = useAuth();


  if (userRole === 'researcher') {
    return <RewardPoolCreator />;
  }

  return <RewardPoolUser />;
}