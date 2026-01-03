
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { StorageService } from './storage';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hydrated: false,
  signInGoogle: async () => {},
  signInEmail: async () => {},
  signUpEmail: async () => {},
  logout: async () => {},
  isOfflineMode: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const isOfflineMode = !auth;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Automatically sync vault on login
        await StorageService.syncAllFromCloud(currentUser.uid);
        setHydrated(true);
      } else {
        setHydrated(false);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.clear(); // Clear local cache on explicit logout for security
    setHydrated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, hydrated, signInGoogle, signInEmail, signUpEmail, logout, isOfflineMode }}>
      {children}
    </AuthContext.Provider>
  );
};
