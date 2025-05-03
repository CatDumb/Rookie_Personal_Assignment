import { useState, useEffect, useCallback } from 'react';
import { getBookDetails, BookDetail } from '../api/book';
import { dispatchCartUpdateEvent } from '../components/Context/CartContext'; // Import dispatch helper

// Interface for the basic cart item stored in localStorage
interface CartItem {
  id: number;
  quantity: number;
}

// Interface for the cart item combined with full book details
export interface CartItemWithDetails extends BookDetail {
  quantity: number;
  order_item_total: number;
}

export const useCartDetails = () => {
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // Function to update localStorage and recalculate totals
  const updateCartState = useCallback((updatedDetailedItems: CartItemWithDetails[]) => {
    setCartItemsWithDetails(updatedDetailedItems);
    const newTotal = updatedDetailedItems.reduce((sum, item) => sum + item.order_item_total, 0);
    setOrderTotal(newTotal);

    // Update localStorage with only id and quantity
    const updatedCartForStorage = updatedDetailedItems.map(({ id, quantity }) => ({ id, quantity }));
    localStorage.setItem('cart', JSON.stringify(updatedCartForStorage));
    dispatchCartUpdateEvent(); // Dispatch event after updating storage
  }, []);

  const fetchCartDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Don't clear here initially, let updates handle it
    // setCartItemsWithDetails([]);
    // setOrderTotal(0);

    try {
      const existingCart = localStorage.getItem('cart');
      let cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

      if (!Array.isArray(cart)) {
        console.error('Cart data in local storage is not an array. Resetting.');
        cart = [];
        localStorage.setItem('cart', JSON.stringify([]));
        dispatchCartUpdateEvent(); // Dispatch event after clearing invalid storage
      }

      if (cart.length === 0) {
        setCartItemsWithDetails([]); // Clear state if cart is empty
        setOrderTotal(0);
        setLoading(false);
        return;
      }

      const detailPromises = cart.map(item =>
        getBookDetails(item.id).then(response => {
          const price = response.book.discount_price ?? response.book.price;
          return {
            ...response.book,
            quantity: item.quantity,
            order_item_total: price * item.quantity
          };
        })
      );

      const detailedItems = await Promise.all(detailPromises);
      updateCartState(detailedItems); // Use the update function

    } catch (err) {
      console.error('Failed to fetch cart details:', err);
      setError('Failed to load cart details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [updateCartState]); // Add updateCartState dependency

  useEffect(() => {
    fetchCartDetails();
  }, [fetchCartDetails]); // Run fetch on mount and when fetchCartDetails changes

  // Function to update item quantity
  const updateItemQuantity = useCallback((itemId: number, change: number) => {
    const MAX_QUANTITY = 8;
    let itemToRemove: CartItemWithDetails | null = null;

    const updatedItems = cartItemsWithDetails.map(item => {
      if (item.id === itemId) {
        let newQuantity = item.quantity + change;

        // Check maximum quantity limit when incrementing
        if (change > 0 && newQuantity > MAX_QUANTITY) {
          alert(`You can only add a maximum of ${MAX_QUANTITY} units for this item.`);
          newQuantity = MAX_QUANTITY; // Cap at max quantity
        }

        // Prepare for potential removal confirmation
        if (newQuantity <= 0) {
          itemToRemove = item; // Store item details for confirmation message
          return item; // Keep item for now, handle removal after confirmation
        }

        const price = item.discount_price ?? item.price;
        return {
          ...item,
          quantity: newQuantity,
          order_item_total: price * newQuantity
        };
      }
      return item;
    });

    // Handle removal confirmation
    if (itemToRemove) {
      const confirmRemoval = window.confirm(
        `Are you sure you want to remove "${(itemToRemove as CartItemWithDetails).name}" from your cart?`
      );
      if (confirmRemoval) {
        // Filter out the confirmed item for removal
        const finalItems = updatedItems.filter(item => item.id !== (itemToRemove as CartItemWithDetails).id);
        updateCartState(finalItems);
      } else {
        // If removal is cancelled, no state update is needed
      }
    } else {
        // If no removal was triggered, update state with quantity changes
        updateCartState(updatedItems);
    }

  }, [cartItemsWithDetails, updateCartState]);

  // Function to remove an item completely (e.g., via a dedicated remove button)
  const removeItem = useCallback((itemId: number) => {
    const itemToRemove = cartItemsWithDetails.find(item => item.id === itemId);
    if (!itemToRemove) return; // Item not found

    const confirmRemoval = window.confirm(
        `Are you sure you want to remove "${itemToRemove.name}" from your cart?`
      );

    if (confirmRemoval) {
        const updatedItems = cartItemsWithDetails.filter(item => item.id !== itemId);
        updateCartState(updatedItems);
    }
  }, [cartItemsWithDetails, updateCartState]);

  // Function to manually refresh the cart
  const refreshCart = useCallback(() => {
    fetchCartDetails();
  }, [fetchCartDetails]);

  return {
    cartItemsWithDetails,
    loading,
    error,
    orderTotal,
    updateItemQuantity, // Expose update function
    removeItem,         // Expose remove function
    refreshCart         // Expose refresh function
  };
};
