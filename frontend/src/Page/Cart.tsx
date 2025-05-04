// --- IMPORTS ---
import { CartHeader } from "../components/Header/CartHeader";
import { useCartDetails } from "../hooks/useCartDetails";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantitySelector";
import { createOrder } from "../api/order";
import { useState, useEffect } from "react";
import { useAuth } from "../components/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { dispatchCartUpdateEvent } from "../components/Context/CartContext";
import { getBookDetails, BookDetailResponse } from "../api/book";

// --- TYPES & INTERFACES ---
// User details interface for the response
interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  admin: boolean;
}

// Interface for invalid book data
interface InvalidBookData {
  id: number;
  name: string;
  reason: string;
}

// --- COMPONENT DEFINITION ---
export default function CartPage() {
    const { cartItemsWithDetails, orderTotal, loading, error, updateItemQuantity, refreshCart } = useCartDetails();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [invalidBooks, setInvalidBooks] = useState<InvalidBookData[]>([]);
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let timerId: NodeJS.Timeout | null = null;
        if (showSuccessNotification) {
            timerId = setTimeout(() => {
                navigate('/');
            }, 10000);
        }

        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [showSuccessNotification, navigate]);

    // Function to validate books in cart
    const validateCartItems = async () => {
        setInvalidBooks([]);
        setValidationError(null);

        try {
            const invalidItems: InvalidBookData[] = [];

            // Check each book in the cart
            for (const item of cartItemsWithDetails) {
                try {
                    // Get the latest book data from the API
                    const response: BookDetailResponse = await getBookDetails(item.id);
                    const currentBookData = response.book;

                    // Check if the book exists (will throw an error if it doesn't)

                    // Check if the discount price matches what we have in cart
                    if (item.discount_price !== null && item.discount_price !== currentBookData.discount_price) {
                        invalidItems.push({
                            id: item.id,
                            name: item.book_title || 'Unknown Book',
                            reason: 'Discount price has changed'
                        });
                        continue;
                    }

                    // Additional validations could be added here

                } catch (error: Error | unknown) {
                    console.error(`Error validating book ${item.id}:`, error);
                    // If we get here, the book likely doesn't exist anymore
                    invalidItems.push({
                        id: item.id,
                        name: item.book_title || 'Unknown Book',
                        reason: 'Book is no longer available'
                    });
                }
            }

            if (invalidItems.length > 0) {
                setInvalidBooks(invalidItems);
                return false;
            }

            return true;
        } catch (error: Error | unknown) {
            console.error('Error validating cart items:', error);
            setValidationError('Failed to validate cart items. Please try again.');
            return false;
        }
    };

    // Function to remove invalid books from cart
    const removeInvalidBooks = () => {
        if (invalidBooks.length === 0) return;

        // Get current cart
        const cartItemsJson = localStorage.getItem('cart');
        const cartItems = cartItemsJson ? JSON.parse(cartItemsJson) : [];

        // Filter out invalid books
        const updatedCartItems = cartItems.filter(
            (item: { id: number }) => !invalidBooks.some(invalidItem => invalidItem.id === item.id)
        );

        // Update local storage
        localStorage.setItem('cart', JSON.stringify(updatedCartItems));

        // Dispatch cart update event to update UI
        dispatchCartUpdateEvent();

        // Refresh cart to show updated items
        refreshCart();

        // Reset invalid books and clear validation error
        setInvalidBooks([]);
        setValidationError(null);
    };

    if (loading) {
        return <div>Loading cart...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">Error: {error}</div>;
    }

    const handlePlaceOrder = async () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            alert("Please log in to place an order");
            return;
        }

        if (cartItemsWithDetails.length === 0) {
            return;
        }

        setIsPlacingOrder(true);
        setOrderError(null);
        setShowSuccessNotification(false);
        setValidationError(null);

        try {
            // First validate all cart items
            const isValid = await validateCartItems();

            if (!isValid) {
                setValidationError('Some items in your cart are no longer available or have changed. Please review and remove them to continue.');
                setIsPlacingOrder(false);
                return;
            }

            // Get the current user's details from the profile endpoint
            const response = await api.get<UserDetails>('/api/user/profile');
            const userId = response.data.id;
            console.log("Got user ID:", userId);

            // Prepare order data with user_id
            const orderData = {
                user_id: userId,
                order_date: new Date().toISOString(),
                order_total: orderTotal,
                items: cartItemsWithDetails.map(item => ({
                    book_id: item.id,
                    quantity: item.quantity,
                    price: item.discount_price !== null ?
                        (item.discount_price ?? 0) :
                        (item.price ?? 0) // Ensure price is always a number
                }))
            };

            console.log("Sending order data:", orderData);

            // Call the API to create the order
            await createOrder(orderData);

            // Clear the cart after successful order
            localStorage.setItem('cart', JSON.stringify([]));

            // Explicitly dispatch the cart update event to update the navbar
            dispatchCartUpdateEvent();

            // Trigger a refresh in the cart
            refreshCart();

            // Show success message via state
            setShowSuccessNotification(true);

        } catch (err) {
            console.error("Failed to place order:", err);
            setOrderError("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div>
            {showSuccessNotification && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-4 rounded-lg shadow-lg z-[200] max-w-md w-full mx-auto text-center">
                    Order placed successfully! Redirecting to homepage shortly...
                </div>
            )}

            {validationError && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[200] max-w-md w-full mx-auto">
                    <p className="font-bold mb-2">Error</p>
                    <p>{validationError}</p>
                    {invalidBooks.length > 0 && (
                        <div className="mt-4">
                            <p className="font-bold">Invalid items:</p>
                            <ul className="list-disc pl-5 mt-2">
                                {invalidBooks.map((book, index) => (
                                    <li key={index}>{book.name} - {book.reason}</li>
                                ))}
                            </ul>
                            <button
                                onClick={removeInvalidBooks}
                                className="mt-4 bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100 font-bold"
                            >
                                Remove invalid items
                            </button>
                        </div>
                    )}
                </div>
            )}

            <CartHeader text={cartItemsWithDetails.length.toString()} />
            <div className="flex flex-col md:flex-row gap-4 py-4">
                <div className="w-full md:w-[60%] border-2 border-gray-400 rounded-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-400">
                            <th className="text-left py-2 px-4 w-[60%]">Name</th>
                            <th className="text-left py-2 px-4 w-[10%]">Price</th>
                            <th className="text-left py-2 px-4 w-[20%]">Quantity</th>
                            <th className="text-left py-2 px-4 w-[10%]">Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cartItemsWithDetails.length > 0 ? (
                            cartItemsWithDetails.map((item) => (
                                <tr key={item.id} className="border-b border-gray-400">
                                <td className="py-2 px-4 w-[40%]">
                                    <div className="flex items-center gap-3">
                                        <a href={`/book/${item.id}`} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={item.cover_photo || '/book.png'}
                                                alt={item.name}
                                                className="w-20 h-auto object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/book.png";
                                                }}
                                            />
                                        </a>
                                        <div className="flex flex-col">
                                            <a href={`/book/${item.id}`} target="_blank" rel="noopener noreferrer">
                                                <span className="font-bold text-xl">{item.name}</span>
                                            </a>
                                            <span className="text-md text-gray-600">{item.author}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2 px-4 w-[20%] items-center">
                                    {item.discount_price !== null ? (
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-lg">
                                        ${item.discount_price.toFixed(2)}
                                        </span>
                                        <span className="line-through text-gray-500 mr-2 text-sm">
                                        ${(item.price ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                    ) : (
                                    <span className="font-bold text-lg">${(item.price ?? 0).toFixed(2)}</span>
                                    )}
                                </td>
                                <td className="py-2 px-4 w-[15%] text-left">
                                    <QuantitySelector
                                        quantity={item.quantity}
                                        onIncrement={() => updateItemQuantity(item.id, 1)}
                                        onDecrement={() => updateItemQuantity(item.id, -1)}
                                        readOnly={false}
                                    />
                                </td>
                                <td className="py-2 px-4 w-[25%] text-left">${item.order_item_total.toFixed(2)}</td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                                Your cart is empty
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="hidden md:block md:w-[20px] md:min-w-[20px] md:max-w-[20px] flex-shrink-0"></div>
                <div className="w-full md:w-[40%] h-fit border-2 border-gray-400 rounded-lg p-4">
                    <div className="text-xl text-center font-bold mb-2">
                        Cart Totals
                    </div>
                    <hr className="border-t border-gray-400 my-2 -mx-4" />

                    <div className="w-full font-bold text-3xl text-center p-4">
                        ${orderTotal.toFixed(2)}
                    </div>
                    {orderError && (
                        <div className="text-red-500 text-center my-2">{orderError}</div>
                    )}
                    <Button
                        className="w-full"
                        disabled={cartItemsWithDetails.length === 0 || isPlacingOrder}
                        onClick={handlePlaceOrder}
                    >
                        {isPlacingOrder ? "Processing..." : "Place order"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
