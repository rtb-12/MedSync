// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  userId: string | null;
  userRole: 'patient' | 'hospital' | 'researcher' | null;
  login: (id: string, role: 'patient' | 'hospital' | 'researcher') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

const USER_ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem(USER_ID_KEY);
  });
  
  const [userRole, setUserRole] = useState<'patient' | 'hospital' | 'researcher' | null>(() => {
    return localStorage.getItem(USER_ROLE_KEY) as AuthContextType['userRole'];
  });

  const login = (id: string, role: 'patient' | 'hospital' | 'researcher') => {
    setUserId(id);
    setUserRole(role);
    localStorage.setItem(USER_ID_KEY, id);
    localStorage.setItem(USER_ROLE_KEY, role);
  };

  const logout = () => {
    setUserId(null);
    setUserRole(null);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
  };

  return (
    <AuthContext.Provider value={{ userId, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Add useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};