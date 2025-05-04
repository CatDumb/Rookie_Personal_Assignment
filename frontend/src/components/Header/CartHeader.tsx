/* Cart Header Component - Displays the cart page title with item count */

/* Props Interface */
interface CartHeaderProps {
    text: string;
}

/**
 * Cart page header displaying the number of items in the cart
 * @param text String representing the number of items in cart
 */
export const CartHeader = ({ text = "3" }: CartHeaderProps) => {
    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>Your Cart: ({text}) item(s)</h3></div>
            <hr></hr>
        </div>
    )
}
