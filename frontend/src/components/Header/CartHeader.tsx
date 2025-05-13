/* Cart Header Component - Displays the cart page title with item count */
import { useTranslation } from 'react-i18next';

/* Props Interface */
interface CartHeaderProps {
    text: string;
}

/**
 * Cart page header displaying the number of items in the cart
 * @param text String representing the number of items in cart
 */
export const CartHeader = ({ text = "3" }: CartHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>{t('header_cart')} ({text}) {t('header_cart_items')}</h3></div>
            <hr></hr>
        </div>
    )
}
