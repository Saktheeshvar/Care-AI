import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ElderlyUser, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  elderlyProfile: ElderlyUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [elderlyProfile, setElderlyProfile] = useState<ElderlyUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const savedRole = (localStorage.getItem('careai_role') as UserRole) || 'CAREGIVER';
        const res = await api.login(savedRole);
        setUser(res.user);
        setElderlyProfile(res.elderlyProfile);
      } catch (err) {
        console.warn('Auth check error, defaulting to Caregiver demo user:', err);
        setUser({
          id: 'user_caregiver_1',
          name: 'Priya Caregiver',
          email: 'priya@careai.family',
          role: 'CAREGIVER'
        });
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (role: UserRole, email?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(role, email);
      setUser(res.user);
      setElderlyProfile(res.elderlyProfile);
      localStorage.setItem('careai_role', role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('careai_role');
  };

  const switchRole = async (newRole: UserRole) => {
    await login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        elderlyProfile,
        role: user?.role || 'CAREGIVER',
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
