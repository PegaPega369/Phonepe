import React, { createContext, useState, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';

type ConfirmationResult = auth.ConfirmationResult; // Define a type alias for ConfirmationResult

type AuthContextType = {
  confirmation: ConfirmationResult | null;
  setConfirmation: (confirmation: ConfirmationResult | null) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  return (
    <AuthContext.Provider value={{ confirmation, setConfirmation }}>
      {children}
    </AuthContext.Provider>
  );
};
