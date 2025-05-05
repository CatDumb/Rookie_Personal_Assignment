/**
 * Utility functions for cart events
 */

/**
 * Dispatches a custom event to notify components that the cart has been updated
 * This helps synchronize cart state across components
 */
export const dispatchCartUpdateEvent = () => {
  // Create a custom event that components can listen for
  const event = new CustomEvent('cart-updated');
  window.dispatchEvent(event);
};
