import { CartHeader } from "../components/Header/CartHeader";
import { BookDetailResponse, getBookDetails } from "@/api/book";

export default function CartPage() {
    // Placeholder cart items for demonstration
    const cartItems = [
        { id: 1, name: "The Great Gatsby", price: 12.99, quantity: 1, total: 12.99 },
        { id: 2, name: "To Kill a Mockingbird", price: 14.99, quantity: 2, total: 29.98 },
        { id: 3, name: "1984", price: 11.50, quantity: 1, total: 11.50 },
    ];

    return (
        <div>
            <CartHeader text={cartItems.length.toString()} />
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
                            {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <tr key={item.id} className="border-b">
                                <td className="py-2 px-4 w-[40%]">{item.name}</td>
                                <td className="py-2 px-4 w-[20%]">${item.price.toFixed(2)}</td>
                                <td className="py-2 px-4 w-[15%]">{item.quantity}</td>
                                <td className="py-2 px-4 w-[25%]">${item.total.toFixed(2)}</td>
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
                <div className="w-full md:w-[40%] border-2 border-gray-400 rounded-lg p-4">
                    <div className="text-xl text-center font-bold mb-2">
                        Cart Totals
                    </div>
                    <hr className="border-t border-gray-400 my-2 -mx-4" />
                    <div>

                    </div>
                </div>
            </div>
        </div>
    )
}
