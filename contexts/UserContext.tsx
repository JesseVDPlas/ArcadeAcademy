import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserProfile = {
  name: string;
  grade: string;
  preferredSubjects: string[];
  tempYear?: string;
};

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  resetUser: () => Promise<void>;
  saveUserToStorage: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const saveUserToStorage = async () => {
    if (user) {
      await SecureStore.setItemAsync('userProfile', JSON.stringify(user));
    }
  };

  const loadUserFromStorage = async () => {
    setLoading(true);
    const data = await SecureStore.getItemAsync('userProfile');
    if (data) {
      setUser(JSON.parse(data));
    }
    setLoading(false);
  };

  const resetUser = async () => {
    await SecureStore.deleteItemAsync('userProfile');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, resetUser, saveUserToStorage, loadUserFromStorage, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}; 