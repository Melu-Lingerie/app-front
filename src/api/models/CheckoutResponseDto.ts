/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderStatus = 'NEW' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type CheckoutResponseDto = {
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    confirmationUrl?: string;
    message: string;
};
