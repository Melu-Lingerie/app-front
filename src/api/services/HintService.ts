import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';

export interface CartHintCreateRequest {
    cartId: number;
    savedAddressId?: number;
    city: string;
    address?: string;
    postalCode?: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
}

export interface CartHintCreateResponse {
    hintId: number;
    shareToken: string;
    shareUrl: string;
    totalAmount: number;
}

export interface CartHintPublicInfo {
    ownerFirstName: string;
    totalAmount: number;
    status: string;
    expiresAt: string;
}

export interface CartHintPayRequest {
    paymentMethod: 'CARD' | 'SBP';
}

export interface CartHintPayResponse {
    confirmationUrl: string;
}

export class HintService {
    /**
     * Создать hint из корзины (авторизованный пользователь)
     */
    public static createHint(
        userId: number,
        requestBody: CartHintCreateRequest,
        options?: Partial<ApiRequestOptions>,
    ): CancelablePromise<CartHintCreateResponse> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/cart/hints',
            headers: {
                'X-User-Id': String(userId),
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Получить публичную информацию о hint (без авторизации)
     */
    public static getHintInfo(
        shareToken: string,
        options?: Partial<ApiRequestOptions>,
    ): CancelablePromise<CartHintPublicInfo> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/hints/{shareToken}',
            path: {
                shareToken,
            },
        });
    }

    /**
     * Оплатить hint (без авторизации)
     */
    public static payHint(
        shareToken: string,
        requestBody: CartHintPayRequest,
        options?: Partial<ApiRequestOptions>,
    ): CancelablePromise<CartHintPayResponse> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/hints/{shareToken}/pay',
            path: {
                shareToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
