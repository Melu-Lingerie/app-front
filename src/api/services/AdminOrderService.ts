/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderResponseDto, PageOrderListResponseDto } from '../models/OrderResponseDto';
import type { OrderStatus } from '../models/CheckoutResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';

export type ShipOrderRequest = {
    tariffCode: number;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
};

export type UpdateStatusRequest = {
    status: OrderStatus;
};

export type CancelOrderRequest = {
    reason: string;
};

export type UpdateCommentRequest = {
    comment: string;
};

export class AdminOrderService {
    /**
     * Get all orders with filters (admin)
     * @param status Filter by order status
     * @param page Page number (0-based)
     * @param size Page size
     * @returns PageOrderListResponseDto Orders list
     * @throws ApiError
     */
    public static getOrders(
        status?: OrderStatus,
        page: number = 0,
        size: number = 10,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<PageOrderListResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/api/v1/admin/orders',
            query: {
                status,
                page,
                size,
            },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Get pending orders (PAID status)
     * @param page Page number (0-based)
     * @param size Page size
     * @returns PageOrderListResponseDto Pending orders
     * @throws ApiError
     */
    public static getPendingOrders(
        page: number = 0,
        size: number = 10,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<PageOrderListResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/api/v1/admin/orders/pending',
            query: {
                page,
                size,
            },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Get order details
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
            url: '/api/v1/admin/orders/{orderId}',
            path: {
                orderId,
            },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Order not found',
            },
        });
    }

    /**
     * Update order status
     * @param orderId Order ID
     * @param requestBody New status
     * @returns OrderResponseDto Updated order
     * @throws ApiError
     */
    public static updateStatus(
        orderId: number,
        requestBody: UpdateStatusRequest,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'PATCH',
            url: '/api/v1/admin/orders/{orderId}/status',
            path: {
                orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid status transition',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Order not found',
            },
        });
    }

    /**
     * Ship order (create CDEK shipment)
     * @param orderId Order ID
     * @param requestBody Shipping details
     * @returns OrderResponseDto Shipped order
     * @throws ApiError
     */
    public static shipOrder(
        orderId: number,
        requestBody: ShipOrderRequest,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/api/v1/admin/orders/{orderId}/ship',
            path: {
                orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Cannot ship order',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Order not found',
            },
        });
    }

    /**
     * Cancel order
     * @param orderId Order ID
     * @param requestBody Cancellation reason
     * @returns OrderResponseDto Cancelled order
     * @throws ApiError
     */
    public static cancelOrder(
        orderId: number,
        requestBody: CancelOrderRequest,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/api/v1/admin/orders/{orderId}/cancel',
            path: {
                orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Cannot cancel order',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Order not found',
            },
        });
    }

    /**
     * Update admin comment
     * @param orderId Order ID
     * @param requestBody Comment
     * @returns OrderResponseDto Updated order
     * @throws ApiError
     */
    public static updateComment(
        orderId: number,
        requestBody: UpdateCommentRequest,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<OrderResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'PUT',
            url: '/api/v1/admin/orders/{orderId}/comment',
            path: {
                orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Order not found',
            },
        });
    }
}
