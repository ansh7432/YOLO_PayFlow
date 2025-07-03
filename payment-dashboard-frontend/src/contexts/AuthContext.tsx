import React, { createContext, useContext, ReactNode } from 'react';

type AuthContextType = {
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
  logout: () => void;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, logout }) => {
  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
};
