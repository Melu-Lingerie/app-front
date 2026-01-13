// Backend order status values
export type OrderStatus = 'NEW' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CARD' | 'SBP';
export type DeliveryMethod = 'CDEK_POINT' | 'CDEK_COURIER';

// UI labels
export const orderStatusLabels: Record<OrderStatus, string> = {
    NEW: 'Новый',
    PAID: 'Оплачен',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    CARD: 'Карта',
    SBP: 'СБП',
};

export const deliveryMethodLabels: Record<DeliveryMethod, string> = {
    CDEK_POINT: 'Пункт СДЭК',
    CDEK_COURIER: 'Курьер СДЭК',
};

export interface OrderItem {
    id: number;
    productId: number;
    variantId: number;
    productName: string;
    articleNumber: string;
    color?: string;
    size?: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface DeliveryAddress {
    city: string;
    address?: string;
    postalCode?: string;
    deliveryPointCode?: string;
    deliveryPointName?: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    deliveryAddress: DeliveryAddress;
    cdekTrackingNumber?: string;
    itemsTotal: number;
    deliveryCost: number;
    discountAmount: number;
    totalAmount: number;
    items: OrderItem[];
    itemsCount: number;
    promoCode?: string;
    customerComment?: string;
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
}

export interface OrderListItem {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    totalAmount: number;
    itemsCount: number;
    createdAt: string;
}

export interface OrderFilters {
    search?: string;
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    deliveryMethod?: DeliveryMethod;
    paymentMethod?: PaymentMethod;
}
