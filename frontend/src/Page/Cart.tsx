import { CartHeader } from "../components/Header/CartHeader";
import { useCartDetails } from "../hooks/useCartDetails";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantitySelector";
import { createOrder } from "../api/order";
import { useState } from "react";
import { useAuth } from "../components/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";
import { dispatchCartUpdateEvent } from "../components/Context/CartContext";

// JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  admin?: boolean;
  exp: number;
  [key: string]: string | number | boolean | undefined;
}

// User details interface for the response
interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  admin: boolean;
}

export default function CartPage() {
    const { cartItemsWithDetails, orderTotal, loading, error, updateItemQuantity, refreshCart } = useCartDetails();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

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

        try {
            // Get the current user's details from the token's email
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error("No access token found");
            }

            // Decode the JWT token to get the email
            const decoded = jwtDecode<JwtPayload>(token);
            console.log("Token payload:", decoded);

            // Use the email to get user details from API
            let userId;
            try {
                const response = await api.get<UserDetails>('/api/user/profile');
                userId = response.data.id;
                console.log("Got user ID:", userId);
            } catch (error) {
                // If the profile endpoint fails, use a fallback approach
                console.warn("Failed to fetch user profile:", error);

                // Try to extract email from token and query user by email
                try {
                    const email = decoded.email || decoded.sub;
                    if (!email) {
                        throw new Error("No email found in token");
                    }

                    // For demonstration purposes, use ID 1 since we can't query by email easily
                    console.warn("Using default user ID 1 for demo purposes");
                    userId = 1;
                } catch (err) {
                    console.error("Could not determine user ID:", err);
                    throw new Error("Could not determine user ID");
                }
            }

            // Prepare order data with user_id
            const orderData = {
                user_id: userId,
                order_date: new Date().toISOString(),
                order_total: orderTotal,
                items: cartItemsWithDetails.map(item => ({
                    book_id: item.id,
                    quantity: item.quantity,
                    price: item.discount_price !== null ? item.discount_price : item.price
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

            // Show success message
            alert("Order placed successfully!");

            // Redirect to homepage or order confirmation page
            navigate('/');
        } catch (err) {
            console.error("Failed to place order:", err);
            setOrderError("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div>
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
                                        <img
                                            src={item.cover_photo || '/book.png'}
                                            alt={item.name}
                                            className="w-20 h-auto object-cover flex-shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "/book.png";
                                            }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xl">{item.name}</span>
                                            <span className="text-md text-gray-600">{item.author}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2 px-4 w-[20%] items-center">
                                    {item.discount_price !== null ? (
                                    <div className="flex items-center">
                                        <span className="font-bold text-lg">
                                        ${item.discount_price.toFixed(2)}
                                        </span>
                                        <span className="line-through text-gray-500 mr-2 text-sm">
                                        ${item.price.toFixed(2)}
                                        </span>
                                    </div>
                                    ) : (
                                    <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
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
