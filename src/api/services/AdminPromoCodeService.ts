import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

// Types
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type PromoCodeAdminResponseDto = {
    id: number;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    usedCount: number;
    maxUsesPerUser?: number;
    validFrom?: string;
    validTo?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type PagePromoCodeAdminResponseDto = {
    content: PromoCodeAdminResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export type PromoCodeAdminCreateRequestDto = {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
};

export type PromoCodeAdminUpdateRequestDto = {
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
};

export class AdminPromoCodeService {
    /**
     * Search promo codes with filters
     */
    public static searchPromoCodes(
        params: {
            isActive?: boolean;
            search?: string;
            page?: number;
            size?: number;
        } = {}
    ): CancelablePromise<PagePromoCodeAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/promo-codes',
            query: {
                isActive: params.isActive,
                search: params.search,
                page: params.page ?? 0,
                size: params.size ?? 10,
            },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Get promo code by ID
     */
    public static getPromoCode(id: number): CancelablePromise<PromoCodeAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/promo-codes/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Promo code not found',
            },
        });
    }

    /**
     * Create promo code
     */
    public static createPromoCode(
        requestBody: PromoCodeAdminCreateRequestDto
    ): CancelablePromise<PromoCodeAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/promo-codes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Update promo code
     */
    public static updatePromoCode(
        id: number,
        requestBody: PromoCodeAdminUpdateRequestDto
    ): CancelablePromise<PromoCodeAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/promo-codes/{id}',
            path: { id },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Promo code not found',
            },
        });
    }

    /**
     * Delete promo code
     */
    public static deletePromoCode(id: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/promo-codes/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Promo code not found',
            },
        });
    }

    /**
     * Toggle promo code active status
     */
    public static toggleActive(id: number): CancelablePromise<PromoCodeAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/promo-codes/{id}/toggle-active',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Promo code not found',
            },
        });
    }
}
