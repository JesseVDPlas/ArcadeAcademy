import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  name?: string;
  grade?: string;
  level?: string;
  preferredSubjects?: string[];
  soundOn: boolean;
};
type UserContextValue = User & {
  setUser: (partial: Partial<User>) => void;
  toggleSound: () => void;
  hydrated: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User>({ soundOn: true });
  const [hydrated, setHydrated] = useState(false);

  // hydrate
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUserState(JSON.parse(stored));
      setHydrated(true);
    })();
  }, []);

  // persist
  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    }
  }, [user, hydrated]);

  const setUser = (partial: Partial<User>) =>
    setUserState((prev) => ({ ...prev, ...partial }));
  const toggleSound = () => setUserState((prev) => ({ ...prev, soundOn: !prev.soundOn }));

  if (!hydrated) return null;

  return (
    <UserContext.Provider value={{ ...user, setUser, toggleSound, hydrated }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}; 