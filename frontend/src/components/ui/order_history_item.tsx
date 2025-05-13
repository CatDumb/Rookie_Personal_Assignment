import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { OrderResponse } from "@/api/order";
import { useTranslation } from "react-i18next";
import { getBookDetails, BookDetail } from "@/api/book";
import { useState, useEffect } from "react";

const Order_Item = (text: string) => {
    return (
        <div>
            {text}
        </div>
    )
}
const Order_Item_Accordion = ({ order}: { order: OrderResponse}) => {
    const { t } = useTranslation();
    const [books, setBooks] = useState<Record<number, BookDetail>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Create an object to store book details by ID
        const bookDetailsMap: Record<number, BookDetail> = {};
        let pendingRequests = order.items.length;

        // Set loading state
        setLoading(true);

        // Fetch details for each book in the order
        order.items.forEach(item => {
            getBookDetails(item.book_id)
                .then(response => {
                    if (response && response.book) {
                        bookDetailsMap[item.book_id] = response.book;
                    }
                })
                .catch(error => {
                    console.error(`Failed to fetch details for book ${item.book_id}:`, error);
                })
                .finally(() => {
                    pendingRequests--;
                    if (pendingRequests === 0) {
                        setBooks(bookDetailsMap);
                        setLoading(false);
                    }
                });
        });
    }, [order]);

    // Format the date to the requested format: hh:mm:ss dd-mm-yy
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        // Get time components
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        // Get date components
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits

        return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    };

    return (
        <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1" className="border border-gray-300 rounded-md mb-2 w-full overflow-hidden" style={{ borderBottom: '1px solid rgb(209, 213, 219)' }}>
                <AccordionTrigger className="p-2 w-full">
                    <div className="grid grid-cols-3 w-full">
                        <div className="text-left">
                            <p>{t('profile_order_history_order_id')}: {order.id}</p>
                        </div>
                        <div className="text-right">
                            <p>{t('profile_order_history_order_total')}: {order.order_total}</p>
                        </div>
                        <div className="text-right">
                            <p>{t('profile_order_history_order_date')}: {formatDate(order.order_date)}</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="w-full overflow-hidden">
                    <div className="grid grid-cols-3 px-4 py-2 font-semibold">
                        <div className="text-left">{t("profile_order_history_book_title")}</div>
                        <div className="text-right">{t("profile_order_history_quantity")}</div>
                        <div className="text-right">{t("profile_order_history_price")}</div>
                    </div>
                    {loading ? (
                        <div className="text-center py-4">Loading book details...</div>
                    ) : (
                        order.items.map((item) => (
                            <div key={item.book_id} className="border-t border-gray-300">
                                <a href={`/book/${item.book_id}`} className="grid grid-cols-3 px-4 py-2 hover:bg-gray-50">
                                    <div className="text-left">{books[item.book_id]?.book_title || "Unknown Book"}</div>
                                    <div className="text-right">{item.quantity}</div>
                                    <div className="text-right">{item.price}</div>
                                </a>
                            </div>
                        ))
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export { Order_Item, Order_Item_Accordion };
