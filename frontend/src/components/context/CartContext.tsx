import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

interface CartItem {
  id: number;
  quantity: number;
}

interface CartContextType {
  cartItemCount: number;
  refreshCartCount: () => void; // Function to manually trigger a count refresh
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Function to get cart count from localStorage
const getCartCountFromStorage = (): number => {
  try {
    const existingCart = localStorage.getItem('cart');
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
    // Ensure cart is an array before calculating count
    return Array.isArray(cart) ? cart.length : 0;
  } catch (error) {
    console.error('Failed to parse cart from local storage:', error);
    localStorage.setItem('cart', JSON.stringify([])); // Clear invalid cart data
    return 0;
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState<number>(getCartCountFromStorage());

  // Function to refresh count, memoized with useCallback
  const refreshCartCount = useCallback(() => {
      setCartItemCount(getCartCountFromStorage());
  }, []);

  useEffect(() => {
    // Initial count is set via useState initializer

    // Listener for storage events (updates from other tabs/windows)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cart') {
        refreshCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listener for custom 'cartUpdated' event (updates within the same tab)
    const handleCartUpdate = () => {
        refreshCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [refreshCartCount]); // Dependency on the memoized refresh function

  const value = { cartItemCount, refreshCartCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Helper function to dispatch the custom event
export const dispatchCartUpdateEvent = () => {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
};
