import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, LoginPayload } from '../../api/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  firstName: string | null;
  lastName: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedFirstName = localStorage.getItem('first_name');
    const storedLastName = localStorage.getItem('last_name');

    if (token) {
      setIsLoggedIn(true);
      setFirstName(storedFirstName);
      setLastName(storedLastName);
    }

    setLoading(false);
  }, []);

  const handleLogin = async (payload: LoginPayload): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await login(payload);

      if (data) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('first_name', data.first_name);
        localStorage.setItem('last_name', data.last_name);

        setIsLoggedIn(true);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setLoading(false);
        return true;
      } else {
        setError('Login failed: Invalid credentials');
        setLoading(false);
        return false;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Login failed: An error occurred ' + err.message);
      } else {
        setError('Login failed: An unknown error occurred');
      }
      setLoading(false);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');

    setIsLoggedIn(false);
    setFirstName(null);
    setLastName(null);
  };

  const value = {
    isLoggedIn,
    firstName,
    lastName,
    login: handleLogin,
    logout: handleLogout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
