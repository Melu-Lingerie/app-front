export type OrderStatus = 'new' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'sbp' | 'cash_on_delivery';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';
export type DeliveryMethod = 'courier' | 'cdek_point' | 'pickup_point';

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    articleNumber: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    customerId: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentTransactionId?: string;
    deliveryMethod: DeliveryMethod;
    deliveryAddress: string;
    deliveryCost: number;
    itemsTotal: number;
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderFilters {
    search?: string;
    status?: OrderStatus[];
    dateFrom?: string;
    dateTo?: string;
    deliveryMethod?: DeliveryMethod[];
    paymentMethod?: PaymentMethod[];
    amountFrom?: number;
    amountTo?: number;
}
