import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ensure path to firebase.js is correct

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  credits: number;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Auth Changes (Login/Logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 2. If Logged In, Listen to Database for Credits
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            credits: data.credits || 0, // REAL-TIME CREDITS
          });
        } else {
          // Fallback if doc doesn't exist yet
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            credits: 0,
          });
        }
        setLoading(false);
      }, (error) => {
        console.error("Database Error:", error);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
