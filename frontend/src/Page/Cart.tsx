/* Import dependencies and components */
import { CartHeader } from "../components/Header/CartHeader";
import { useCartDetails } from "../hooks/useCartDetails";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantitySelector";
import { createOrder } from "../api/order";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserDetails } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { dispatchCartUpdateEvent } from "../hooks/useCartEvents";
import { getBookDetails, BookDetailResponse } from "../api/book";
import { openLoginDialog } from '@/components/Navbar/Navbar';
import { useTranslation } from 'react-i18next';

interface InvalidBookData {
  id: number;
  name: string;
  reason: string;
}

// Define API error response types
interface ApiErrorDetail {
  type: string;
  loc: string[];
  msg: string;
  input?: Record<string, unknown>;
}

interface ApiErrorResponse {
  detail?: ApiErrorDetail[];
  [key: string]: unknown;
}

/* Main Cart Page Component */
export default function CartPage() {
    const { cartItemsWithDetails, orderTotal, loading, error, updateItemQuantity, refreshCart } = useCartDetails();
    const { t } = useTranslation();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [invalidBooks, setInvalidBooks] = useState<InvalidBookData[]>([]);
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    /* Redirect timer effect after successful order */
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

    /* Validate cart items to ensure they're still available and prices match */
    const validateCartItems = async () => {
        setInvalidBooks([]);
        setValidationError(null);

        try {
            const invalidItems: InvalidBookData[] = [];

            /* Check each book in the cart */
            for (const item of cartItemsWithDetails) {
                try {
                    /* Get the latest book data from the API */
                    const response: BookDetailResponse = await getBookDetails(item.id);
                    const currentBookData = response.book;

                    /* Check if the discount price matches what we have in cart */
                    if (item.discount_price !== null && item.discount_price !== currentBookData.discount_price) {
                        invalidItems.push({
                            id: item.id,
                            name: item.book_title || 'Unknown Book',
                            reason: 'Discount price has changed'
                        });
                        continue;
                    }

                } catch (error: Error | unknown) {
                    console.error(`Error validating book ${item.id}:`, error);
                    /* If we get here, the book likely doesn't exist anymore */
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

    /* Remove invalid books from the cart */
    const removeInvalidBooks = () => {
        if (invalidBooks.length === 0) return;

        /* Get current cart */
        const cartItemsJson = localStorage.getItem('cart');
        const cartItems = cartItemsJson ? JSON.parse(cartItemsJson) : [];

        /* Filter out invalid books */
        const updatedCartItems = cartItems.filter(
            (item: { id: number }) => !invalidBooks.some(invalidItem => invalidItem.id === item.id)
        );

        /* Update local storage */
        localStorage.setItem('cart', JSON.stringify(updatedCartItems));

        /* Dispatch cart update event to update UI */
        dispatchCartUpdateEvent();

        /* Refresh cart to show updated items */
        refreshCart();

        /* Reset invalid books and clear validation error */
        setInvalidBooks([]);
        setValidationError(null);
    };

    if (loading) {
        return <div>Loading cart...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">Error: {error}</div>;
    }

    /* Handle the order placement process */
    const handlePlaceOrder = async () => {
        /* Check if user is logged in */
        if (!isLoggedIn) {
            alert("Please log in to place an order");
            // Open the login dialog after showing the alert
            openLoginDialog();
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
            /* First validate all cart items */
            const isValid = await validateCartItems();

            if (!isValid) {
                setValidationError('Some items in your cart are no longer available or have changed. Please review and remove them to continue.');
                setIsPlacingOrder(false);
                return;
            }

            /* Get the current user's details from the profile endpoint */
            const userDetails = await getUserDetails();
            setUserId(userDetails.id);

            if (!userId) {
                setOrderError("Failed to retrieve your account information. Please try logging in again.");
                setIsPlacingOrder(false);
                return;
            }

            /* Prepare order data with user_id */
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

            /* Call the API to create the order */
            await createOrder(orderData);

            /* Clear the cart after successful order */
            localStorage.setItem('cart', JSON.stringify([]));

            /* Explicitly dispatch the cart update event to update the navbar */
            dispatchCartUpdateEvent();

            /* Trigger a refresh in the cart */
            refreshCart();

            /* Show success message via state */
            setShowSuccessNotification(true);

        } catch (err: unknown) {
            console.error("Failed to place order:", err);

            // Get more detailed error message if available
            let errorMessage = "Failed to place order. Please try again.";

            if (err && typeof err === 'object' && 'response' in err &&
                err.response && typeof err.response === 'object' &&
                'data' in err.response) {
                const errorData = err.response.data as ApiErrorResponse;

                // Check for specific error types
                if (errorData.detail && Array.isArray(errorData.detail)) {
                    const userIdError = errorData.detail.find(
                        (error: ApiErrorDetail) => error.loc && error.loc.includes('user_id')
                    );

                    if (userIdError) {
                        errorMessage = t('cart_error_user_verification');
                        // Optionally open login dialog here too
                        openLoginDialog();
                    }
                }
            }

            setOrderError(errorMessage);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div>
            {/* Success notification - shows after successful order placement */}
            {showSuccessNotification && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-4 rounded-lg shadow-lg z-[200] max-w-md w-full mx-auto text-center">
                    Order placed successfully! Redirecting to homepage shortly...
                </div>
            )}

            {/* Validation error notification - shows when items in cart are invalid */}
            {validationError && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[200] max-w-md w-full mx-auto">
                    <p className="font-bold mb-2">{t('cart_error_title')}</p>
                    <p>{validationError}</p>
                    {invalidBooks.length > 0 && (
                        <div className="mt-4">
                            <p className="font-bold">{t('cart_error_invalid_items')}</p>
                            <ul className="list-disc pl-5 mt-2">
                                {invalidBooks.map((book, index) => (
                                    <li key={index}>{book.name} - {book.reason}</li>
                                ))}
                            </ul>
                            <button
                                onClick={removeInvalidBooks}
                                className="mt-4 bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100 font-bold"
                            >
                                {t('cart_error_remove_invalid')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Cart header showing number of items */}
            <CartHeader text={cartItemsWithDetails.length.toString()} />
            <div className="flex flex-col md:flex-row gap-4 py-4">
                {/* Cart items table section */}
                <div className="w-full md:w-[60%] border-2 border-gray-400 rounded-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-400">
                            <th className="text-left py-2 px-4 w-[60%]">{t('cart_name')}</th>
                            <th className="text-left py-2 px-4 w-[10%]">{t('cart_price')}</th>
                            <th className="text-left py-2 px-4 w-[20%]">{t('cart_quantity')}</th>
                            <th className="text-left py-2 px-4 w-[10%]">{t('cart_total')}</th>
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
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val > 0) {
                                                // Calculate the change required to reach the new value
                                                const change = val - item.quantity;
                                                updateItemQuantity(item.id, change);
                                            }
                                        }}
                                    />
                                </td>
                                <td className="py-2 px-4 w-[25%] text-left">${item.order_item_total.toFixed(2)}</td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                                {t('cart_empty')}
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="hidden md:block md:w-[20px] md:min-w-[20px] md:max-w-[20px] flex-shrink-0"></div>
                {/* Order summary and checkout section */}
                <div className="w-full md:w-[40%] h-fit border-2 border-gray-400 rounded-lg p-4">
                    <div className="text-xl text-center font-bold mb-2">
                        {t('cart_totals')}
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
                        {isPlacingOrder ? t('cart_processing') : t('cart_place_order')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
