/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckoutRequestDto } from '../models/CheckoutRequestDto';
import type { CheckoutResponseDto } from '../models/CheckoutResponseDto';
import type { OrderResponseDto, PageOrderListResponseDto } from '../models/OrderResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';

export class OrderService {
    /**
     * Create order from cart (checkout)
     * @param requestBody Checkout request data
     * @returns CheckoutResponseDto Order created successfully
     * @throws ApiError
     */
    public static checkout(
        requestBody: CheckoutRequestDto,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<CheckoutResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request data',
                404: 'Cart not found',
                409: 'Insufficient stock',
            },
        });
    }

    /**
     * Get my orders (paginated)
     * @param page Page number (0-based)
     * @param size Page size
     * @returns PageOrderListResponseDto Orders retrieved successfully
     * @throws ApiError
     */
    public static getMyOrders(
        page: number = 0,
        size: number = 10,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<PageOrderListResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/orders',
            query: {
                page,
                size,
            },
            errors: {
                401: 'Unauthorized',
            },
        });
    }

    /**
     * Get order by ID
     * @param orderId Order ID
     * @returns OrderResponseDto Order details
     * @throws ApiError
     */
    public static getOrder(
        orderId: number,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/orders/{orderId}',
            path: {
                orderId,
            },
            errors: {
                404: 'Order not found',
            },
        });
    }

    /**
     * Get order by order number
     * @param orderNumber Order number (e.g., ML-2024-1229-000001)
     * @returns OrderResponseDto Order details
     * @throws ApiError
     */
    public static getOrderByNumber(
        orderNumber: string,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/orders/number/{orderNumber}',
            path: {
                orderNumber,
            },
            errors: {
                404: 'Order not found',
            },
        });
    }

    /**
     * Cancel order
     * @param orderId Order ID
     * @returns OrderResponseDto Order cancelled successfully
     * @throws ApiError
     */
    public static cancelOrder(
        orderId: number,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/orders/{orderId}/cancel',
            path: {
                orderId,
            },
            errors: {
                400: 'Order cannot be cancelled',
                404: 'Order not found',
            },
        });
    }

    /**
     * Retry payment for order
     * @param orderId Order ID
     * @returns CheckoutResponseDto New payment URL
     * @throws ApiError
     */
    public static retryPayment(
        orderId: number,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<CheckoutResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/orders/{orderId}/retry-payment',
            path: {
                orderId,
            },
            errors: {
                400: 'Order is not in NEW status',
                404: 'Order not found',
            },
        });
    }
}
