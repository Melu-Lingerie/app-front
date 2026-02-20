import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

// Types
export type BannerAdminResponseDto = {
    id: number;
    title: string;
    url: string;
    mediaId?: number;
    mediaUrl?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    placement?: string;
};

export type BannerAdminCreateRequestDto = {
    title: string;
    url: string;
    mediaId?: number;
    order?: number;
    isActive?: boolean;
    placement?: string;
};

export type BannerAdminUpdateRequestDto = {
    title?: string;
    url?: string;
    mediaId?: number;
    order?: number;
    isActive?: boolean;
};

export type BannerReorderRequestDto = {
    bannerIds: number[];
};

export class AdminBannerService {
    /**
     * Get all banners
     */
    public static getAllBanners(placement?: string): CancelablePromise<BannerAdminResponseDto[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/banners',
            query: {
                placement,
            },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Get banner by ID
     */
    public static getBanner(id: number): CancelablePromise<BannerAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/banners/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Banner not found',
            },
        });
    }

    /**
     * Create banner
     */
    public static createBanner(
        requestBody: BannerAdminCreateRequestDto
    ): CancelablePromise<BannerAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/banners',
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
     * Update banner
     */
    public static updateBanner(
        id: number,
        requestBody: BannerAdminUpdateRequestDto
    ): CancelablePromise<BannerAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/banners/{id}',
            path: { id },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Banner not found',
            },
        });
    }

    /**
     * Delete banner
     */
    public static deleteBanner(id: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/banners/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Banner not found',
            },
        });
    }

    /**
     * Reorder banners
     */
    public static reorderBanners(
        requestBody: BannerReorderRequestDto
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/banners/reorder',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }
}
