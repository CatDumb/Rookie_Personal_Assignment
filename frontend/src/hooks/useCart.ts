/**
 * Custom hook for using cart context
 */
import { useContext } from 'react';
import { CartContext } from '../components/Context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
