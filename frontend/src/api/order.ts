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

export interface OrderResponse {
    id: number
    user_id: number
    order_date: string
    order_total: number
    items: OrderItem[]
}

export interface OrderListResponse {
    orders: OrderResponse[]
}

export const createOrder = async (order: Order) => {
    const response = await api.post('/api/order/create', order)
    return response.data
}

export const getOrdersById = async (id: number) => {
    const response = await api.get(`/api/order/get/${id}`)
    return response.data
}
