import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, UserRole } from '../types';
import LoadingScreen from '../components/LoadingScreen';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            displayName: userData.displayName,
            role: userData.role,
            photoURL: user.photoURL || undefined
          });
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: name
      });
      
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: user.email,
        role: role,
        createdAt: Date.now()
      });
      
      setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        displayName: name,
        role: role
      });
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider