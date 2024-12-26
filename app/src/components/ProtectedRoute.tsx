import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '@calimero-network/calimero-client';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if user is authenticated using access token
  const accessToken = getAccessToken();

  if (!accessToken) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  // Render child components if authenticated
  return children;
}