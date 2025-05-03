import api from './client.ts'

export interface Order {
    user_id: number
    order_date: string
    order_total: number
    items: OrderItem[]
}

export interface OrderItem {
    book_id: number
    quantity: number
    price: number
}

export const createOrder = async (order: Order) => {
    const response = await api.post('/api/order/create', order)
    return response.data
}
