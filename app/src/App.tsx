import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AccessTokenWrapper } from '@calimero-network/calimero-client';
import { AuthProvider } from './contexts/AuthContext';
import { getNodeUrl } from './utils/node';
import PatientDashboard from './pages/patient/PatientDashboard';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import SetupPage from './pages/setup';
import Authenticate from './pages/login/Authenticate';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import HomePage from './pages/home/index';
import { ThemeProvider } from './contexts/ThemeContext';
import { RewardPool } from './pages/reward-pool/RewardPool.tsx';
import { RoleSelection } from './pages/login/RoleSelection';
import StarknetProvider from './components/starknet-provider';
import { RewardPoolCreator } from './pages/reward-pool/RewardPoolCreator';
import { RewardPoolUser } from './pages/reward-pool/RewardPoolUser';

export default function App() {
  return (
    <ThemeProvider>
      <StarknetProvider>
        <AuthProvider>
          <AccessTokenWrapper getNodeUrl={getNodeUrl}>
            <BrowserRouter>
              <Navigation />
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<Authenticate />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<SetupPage />} />
                  <Route path="/auth" element={<Authenticate />} />
                  <Route
                    path="/patient"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="hospital"
                    element={
                      <ProtectedRoute>
                        <HospitalDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route
                  path="/reward-pool"
                  element={
                    <ProtectedRoute>
                      <RewardPool />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AccessTokenWrapper>
        </AuthProvider>
      </StarknetProvider>
    </ThemeProvider>
  );
}
