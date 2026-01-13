/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderStatus } from './CheckoutResponseDto';
import type { PaymentMethod, DeliveryMethod } from './CheckoutRequestDto';

export type DeliveryAddressDto = {
    city: string;
    address?: string;
    postalCode?: string;
    deliveryPointCode?: string;
    deliveryPointName?: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
};

export type OrderItemDto = {
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
};

export type OrderResponseDto = {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    deliveryAddress: DeliveryAddressDto;
    cdekTrackingNumber?: string;
    itemsTotal: number;
    deliveryCost: number;
    discountAmount: number;
    totalAmount: number;
    items: OrderItemDto[];
    itemsCount: number;
    promoCode?: string;
    customerComment?: string;
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
};

export type OrderListResponseDto = {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    totalAmount: number;
    itemsCount: number;
    createdAt: string;
};

export type PageOrderListResponseDto = {
    content: OrderListResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};
