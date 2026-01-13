/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PaymentMethod = 'CARD' | 'SBP';
export type DeliveryMethod = 'CDEK_POINT' | 'CDEK_COURIER';

export type CheckoutRequestDto = {
    cartId: number;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    city: string;
    address?: string;
    postalCode?: string;
    deliveryPointCode?: string;
    deliveryPointName?: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
    promoCode?: string;
    customerComment?: string;
    tariffCode: number;
};
