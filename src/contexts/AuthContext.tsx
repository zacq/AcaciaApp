import React, { createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const mockProfile: Profile = {
  id: 'local',
  full_name: 'Local User',
  email: '',
  role: 'super_admin',
  is_active: true,
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: mockProfile,
  loading: false,
  isAuthReady: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={{ user: null, profile: mockProfile, loading: false, isAuthReady: true }}>
      {children}
    </AuthContext.Provider>
  );
};
