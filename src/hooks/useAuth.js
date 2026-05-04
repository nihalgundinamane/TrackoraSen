import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser]       = useState(undefined); // undefined = loading
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    user,                          // null = signed out, object = signed in, undefined = loading
    isLoading: user === undefined,
    isLoggedIn: !!user,
    login,
    logout,
    error,
    authLoading: loading,
  };
};
