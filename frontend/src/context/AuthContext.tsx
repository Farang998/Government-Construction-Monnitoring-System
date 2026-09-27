import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface UserProfile {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  designation: string;
  hierarchyLevel: number;
  financialApprovalLimitInr: number;
  department: string;
  departmentCode: string;
  office: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { employeeId: string; password: string }) => Promise<void>;
  quickLoginAsPersona: (employeeId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gov_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api
        .getMe()
        .then((res) => {
          if (res.success) {
            setUser(res.data);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials: { employeeId: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success) {
      localStorage.setItem('gov_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const quickLoginAsPersona = async (employeeId: string) => {
    return login({ employeeId, password: 'GovPassword@2026' });
  };

  const logout = () => {
    localStorage.removeItem('gov_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickLoginAsPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
