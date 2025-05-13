import { getOrdersById, OrderListResponse } from "../../../api/order";
import { getUserDetails } from "../../../api/auth";
import { useCallback, useState, useEffect } from "react";
import { Order_Item_Accordion } from "../../../components/ui/order_history_item";
import { useTranslation } from 'react-i18next';

const OrderHistory = () => {
    const [orders, setOrders] = useState<OrderListResponse | null>(null);
    const { t } = useTranslation();

    const fetchOrders = useCallback(async () => {
        try {
            const userDetails = await getUserDetails();
            if (userDetails.id) {
                const orders = await getOrdersById(userDetails.id);
                setOrders(orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('profile_order_history_title')}</h2>
            <hr />
            <div className="flex flex-col p-4">
                {orders?.orders.map((order) => (
                    <Order_Item_Accordion key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
