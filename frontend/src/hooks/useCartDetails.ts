/* Cart Details Hook - Manages shopping cart data with detailed product information */
import { useState, useEffect, useCallback } from 'react';
import { getBookDetails, BookDetail } from '../api/book';
import { dispatchCartUpdateEvent } from './useCartEvents'; // Updated import path

/* Type Definitions */
// Interface for the basic cart item stored in localStorage
interface CartItem {
  id: number;
  quantity: number;
}

// Extended BookDetail with legacy fields for backward compatibility
interface BookDetailWithLegacy extends BookDetail {
  price?: number;
  name?: string;
  cover_photo?: string | null;
  average_rating?: number;
  summary?: string;
}

// Interface for the cart item combined with full book details
export interface CartItemWithDetails extends BookDetailWithLegacy {
  quantity: number;
  order_item_total: number;
}

/**
 * Custom hook to handle cart operations and maintain synchronized state
 * with localStorage and detailed book information
 */
export const useCartDetails = () => {
  /* State Management */
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  /* Updates Cart in State and localStorage */
  const updateCartState = useCallback((updatedDetailedItems: CartItemWithDetails[]) => {
    setCartItemsWithDetails(updatedDetailedItems);
    const newTotal = updatedDetailedItems.reduce((sum, item) => sum + item.order_item_total, 0);
    setOrderTotal(newTotal);

    // Update localStorage with only id and quantity
    const updatedCartForStorage = updatedDetailedItems.map(({ id, quantity }) => ({ id, quantity }));
    localStorage.setItem('cart', JSON.stringify(updatedCartForStorage));
    dispatchCartUpdateEvent(); // Dispatch event after updating storage
  }, []);

  /* Fetches Full Book Details for Cart Items */
  const fetchCartDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Don't clear here initially, let updates handle it
    // setCartItemsWithDetails([]);
    // setOrderTotal(0);

    try {
      const existingCart = localStorage.getItem('cart');
      let cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

      // Validate cart data structure
      if (!Array.isArray(cart)) {
        console.error('Cart data in local storage is not an array. Resetting.');
        cart = [];
        localStorage.setItem('cart', JSON.stringify([]));
        dispatchCartUpdateEvent(); // Dispatch event after clearing invalid storage
      }

      // Handle empty cart case
      if (cart.length === 0) {
        setCartItemsWithDetails([]); // Clear state if cart is empty
        setOrderTotal(0);
        setLoading(false);
        return;
      }

      // Fetch detailed information for each cart item
      const detailPromises = cart.map(item =>
        getBookDetails(item.id).then(response => {
          // Get the effective price for calculation
          const effectivePrice = response.book.discount_price ?? response.book.book_price;

          // Create the cart item with details including type assertion for safety
          const bookWithDetails = {
            ...response.book,
            quantity: item.quantity,
            order_item_total: effectivePrice * item.quantity,
            // Add legacy fields
            price: response.book.book_price,
            name: response.book.book_title,
            cover_photo: response.book.book_cover_photo,
            average_rating: response.book.avg_rating,
            summary: response.book.book_summary
          } as unknown as CartItemWithDetails;

          return bookWithDetails;
        })
      );

      const detailedItems = await Promise.all(detailPromises);
      updateCartState(detailedItems as CartItemWithDetails[]); // Use the update function

    } catch (err) {
      console.error('Failed to fetch cart details:', err);
      setError('Failed to load cart details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [updateCartState]); // Add updateCartState dependency

  /* Fetch Cart Data on Component Mount */
  useEffect(() => {
    fetchCartDetails();
  }, [fetchCartDetails]); // Run fetch on mount and when fetchCartDetails changes

  /* Update Item Quantity with Validation */
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
          itemToRemove = { ...item }; // Store item details for confirmation message
          return item; // Keep item for now, handle removal after confirmation
        }

        const price = item.discount_price ?? item.book_price;
        return {
          ...item,
          quantity: newQuantity,
          order_item_total: price * newQuantity
        } as CartItemWithDetails;
      }
      return item;
    });

    // Handle removal confirmation
    if (itemToRemove) {
      const bookTitle = itemToRemove.book_title || itemToRemove.name || 'this item';
      const confirmRemoval = window.confirm(
        `Are you sure you want to remove "${bookTitle}" from your cart?`
      );
      if (confirmRemoval) {
        // Filter out the confirmed item for removal
        const finalItems = updatedItems.filter(item => item.id !== itemToRemove.id);
        updateCartState(finalItems);
      } else {
        // If removal is cancelled, no state update is needed
      }
    } else {
        // If no removal was triggered, update state with quantity changes
        updateCartState(updatedItems);
    }

  }, [cartItemsWithDetails, updateCartState]);

  /* Remove Item from Cart with Confirmation */
  const removeItem = useCallback((itemId: number) => {
    const itemToRemove = cartItemsWithDetails.find(item => item.id === itemId);
    if (!itemToRemove) return; // Item not found

    const bookTitle = itemToRemove.book_title || itemToRemove.name || 'this item';
    const confirmRemoval = window.confirm(
      `Are you sure you want to remove "${bookTitle}" from your cart?`
    );

    if (confirmRemoval) {
        const updatedItems = cartItemsWithDetails.filter(item => item.id !== itemId);
        updateCartState(updatedItems);
    }
  }, [cartItemsWithDetails, updateCartState]);

  /* Refresh Cart Data Manually */
  const refreshCart = useCallback(() => {
    fetchCartDetails();
  }, [fetchCartDetails]);

  /* Return Hook Values and Functions */
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
