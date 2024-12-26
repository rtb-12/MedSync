// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  userId: string | null;
  userRole: 'patient' | 'hospital' | null;
  login: (id: string, role: 'patient' | 'hospital') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'hospital' | null>(null);

  const login = (id: string, role: 'patient' | 'hospital') => {
    setUserId(id);
    setUserRole(role);
  };

  const logout = () => {
    setUserId(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userId, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
