/* Cart Context - Manages shopping cart state and synchronization across components */
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

/* Custom Event for Cart Updates */
export const dispatchCartUpdateEvent = () => {
  // Create a custom event that components can listen for
  const event = new CustomEvent('cart-updated');
  window.dispatchEvent(event);
};

/* Type Definitions */
interface CartContextType {
  cartItemCount: number;
  refreshCartCount: () => void; // Function to manually trigger a count refresh
}

/* Context Creation */
const CartContext = createContext<CartContextType | null>(null);

/* Custom Hook for Using Cart Context */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

/* Cart Item Structure */
interface CartItem {
  id: number;
  quantity: number;
}

/* Cart Provider Component */
export const CartProvider = ({ children }: CartProviderProps) => {
  /* State Management */
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  /* Calculate Cart Item Count from Local Storage */
  const calculateCartItemCount = () => {
    try {
      const cartItemsJson = localStorage.getItem('cart');
      if (cartItemsJson) {
        const cartItems: CartItem[] = JSON.parse(cartItemsJson);
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        return totalItems;
      }
      return 0;
    } catch (error) {
      console.error('Error calculating cart items:', error);
      return 0;
    }
  };

  /* Function to manually refresh cart count */
  const refreshCartCount = () => {
    setCartItemCount(calculateCartItemCount());
  };

  /* Update Cart Count on Mount and When Cart Changes */
  useEffect(() => {
    // Initialize cart item count
    setCartItemCount(calculateCartItemCount());

    // Update cart item count whenever the cart is updated
    const handleCartUpdated = () => {
      setCartItemCount(calculateCartItemCount());
    };

    // Listen for custom cart update events
    window.addEventListener('cart-updated', handleCartUpdated);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, []);

  /* Context Provider Value */
  const value = {
    cartItemCount,
    refreshCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
