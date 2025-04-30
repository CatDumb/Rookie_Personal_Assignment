import api from "./client";

export interface OnSaleItem {
    id: number;
    name: string;
    author: string;
    price: number;
    discount_price: number | null;
    cover_photo: string | null;  // Allow null values
    discount_amount: number | null;  // Make optional
}

// Update the interface to match the actual API response structure
export interface OnSaleResponse {
    items: OnSaleItem[];
}

export function getOnSale() {
    return api.get<OnSaleResponse>("api/book/on_sale")
        .then(res => {
            // Check if res.data.items exists and is an array
            if (res.data && res.data.items && Array.isArray(res.data.items)) {
                return res.data.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    author: item.author,
                    price: item.price,
                    discount_price: item.discount_price,
                    // Provide a default value for null cover_photo
                    cover_photo: item.cover_photo || "/book.png",
                    discount_amount: item.discount_amount || 0,
                }));
            }
            // Return empty array if data structure is unexpected
            console.error("Unexpected response structure:", res.data);
            return [];
        });
}
