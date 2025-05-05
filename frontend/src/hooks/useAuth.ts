/**
 * Custom hook for using authentication context
 */
import { useContext } from 'react';
import { AuthContext } from '../components/Context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
