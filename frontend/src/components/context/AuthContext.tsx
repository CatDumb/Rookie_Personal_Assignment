/* Authentication Context - Manages user authentication state and token handling */
import { createContext, useState, useEffect, ReactNode } from 'react';
import { login, LoginPayload, refreshToken } from '../../api/auth';
import { jwtDecode } from 'jwt-decode';
import { dispatchCartUpdateEvent } from '../../hooks/useCartEvents';

/* Type Definitions */
interface JwtPayload {
  exp: number;
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  admin?: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface AuthContextType {
  isLoggedIn: boolean;
  firstName: string | null;
  lastName: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

/* Context Creation */
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/* Authentication Provider Component */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  /* State Management */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTimerId, setRefreshTimerId] = useState<number | null>(null);

  /* Token Validation and Refresh Scheduling */
  const checkAndScheduleRefresh = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found');
        return false;
      }

      // Decode the token to get expiration
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = decoded.exp;
      const timeUntilExpiry = expiryTime - currentTime;

      console.log(`Token expiration check:
        - Current time: ${new Date(currentTime * 1000).toISOString()}
        - Expiry time: ${new Date(expiryTime * 1000).toISOString()}
        - Time until expiry: ${timeUntilExpiry} seconds`);

      // If token is expired, try to refresh it immediately
      if (timeUntilExpiry <= 0) {
        console.log('Access token has expired, attempting refresh...');
        handleRefreshToken();
        return false;
      }

      // Schedule refresh 1 minute before expiry (or immediately if less than 1 minute)
      const refreshTime = Math.max(0, timeUntilExpiry - 60) * 1000;
      console.log(`Scheduling token refresh in ${refreshTime / 1000} seconds`);

      // Clear any existing timer
      if (refreshTimerId !== null) {
        window.clearTimeout(refreshTimerId);
        console.log('Cleared existing refresh timer');
      }

      // Set new timer for refresh
      const timerId = window.setTimeout(() => {
        console.log('Scheduled token refresh triggered');
        handleRefreshToken();
      }, refreshTime);

      setRefreshTimerId(timerId);
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  };

  /* Token Refresh Handler */
  const handleRefreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        console.log('No refresh token found, logging out');
        handleLogout();
        return;
      }

      console.log('Attempting to refresh access token using refresh token');
      const data = await refreshToken(refreshTokenValue);

      if (data && data.access_token) {
        console.log('Successfully refreshed access token');
        localStorage.setItem('access_token', data.access_token);

        // Schedule the next refresh
        checkAndScheduleRefresh();
      } else {
        console.log('Token refresh failed: No new access token received');
        handleLogout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  };

  /* Initial Authentication Check on Component Mount */
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshTokenValue = localStorage.getItem('refresh_token');
      const storedFirstName = localStorage.getItem('first_name');
      const storedLastName = localStorage.getItem('last_name');

      // If we have an access token, check if it's valid
      if (accessToken) {
        const isValid = checkAndScheduleRefresh();
        if (isValid) {
          console.log('User automatically logged in with valid access token');
          setIsLoggedIn(true);
          setFirstName(storedFirstName);
          setLastName(storedLastName);
          setLoading(false);
          return;
        }
      }

      // If access token is missing or invalid but we have a refresh token, try to refresh
      if (refreshTokenValue) {
        try {
          console.log('Attempting to refresh token on page load');
          const data = await refreshToken(refreshTokenValue);
          if (data && data.access_token) {
            console.log('User automatically logged in with refreshed token');
            localStorage.setItem('access_token', data.access_token);

            // Since refresh response doesn't include these values, we use existing stored values
            setIsLoggedIn(true);
            setFirstName(storedFirstName);
            setLastName(storedLastName);

            // Schedule token refresh
            checkAndScheduleRefresh();
          } else {
            console.log('Token refresh failed, logging out');
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to refresh token on initial load:', err);
          handleLogout();
        }
      }

      setLoading(false);
    };

    checkAuth();

    // Clean up timer on unmount
    return () => {
      if (refreshTimerId !== null) {
        window.clearTimeout(refreshTimerId);
      }
    };
  }, []);

  /* Login Handler */
  const handleLogin = async (payload: LoginPayload): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await login(payload);

      if (data) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('first_name', data.first_name);
        localStorage.setItem('last_name', data.last_name);

        setIsLoggedIn(true);
        setFirstName(data.first_name);
        setLastName(data.last_name);

        // Schedule token refresh
        checkAndScheduleRefresh();

        setLoading(false);
        return true;
      } else {
        setError('Invalid email or password');
        setLoading(false);
        return false;
      }
    } catch (err: unknown) {
      console.error('Login error:', err);

      // Check if the error has response and status properties, typical of Axios errors
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'status' in err.response && err.response.status === 401) {
        setError('Invalid email or password');
      } else if (err instanceof Error) {
        // Handle other specific errors if needed, or show a generic message
        setError('Login failed: An error occurred. Please try again later.');
      } else {
        // Fallback for unknown error types
        setError('Login failed: An unknown error occurred.');
      }

      setLoading(false);
      return false;
    }
  };

  /* Logout Handler */
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    localStorage.removeItem('cart');

    // Dispatch event to update cart count
    dispatchCartUpdateEvent();

    // Clear refresh timer
    if (refreshTimerId !== null) {
      window.clearTimeout(refreshTimerId);
      setRefreshTimerId(null);
    }

    setIsLoggedIn(false);
    setFirstName(null);
    setLastName(null);
  };

  /* Context Provider Value */
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
