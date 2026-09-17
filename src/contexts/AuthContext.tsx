'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  check_login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  check_login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const check_login = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      setLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    check_login();
  }, []);

  const value = useMemo(() => ({ isLoggedIn, check_login, logout }), [isLoggedIn, check_login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
