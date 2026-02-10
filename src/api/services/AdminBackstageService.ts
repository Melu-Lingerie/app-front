import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

// Types
export type BackstageAdminResponseDto = {
    id: number;
    title: string;
    description?: string;
    mediaId?: number;
    mediaUrl?: string;
    mediaType?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type BackstageAdminCreateRequestDto = {
    title: string;
    description?: string;
    mediaId?: number;
    sortOrder?: number;
    isActive?: boolean;
};

export type BackstageAdminUpdateRequestDto = {
    title?: string;
    description?: string;
    mediaId?: number;
    sortOrder?: number;
    isActive?: boolean;
};

export type BackstageReorderRequestDto = {
    backstageIds: number[];
};

export class AdminBackstageService {
    public static getAllBackstages(): CancelablePromise<BackstageAdminResponseDto[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/backstages',
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    public static getBackstage(id: number): CancelablePromise<BackstageAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/backstages/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Backstage not found',
            },
        });
    }

    public static createBackstage(
        requestBody: BackstageAdminCreateRequestDto
    ): CancelablePromise<BackstageAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/backstages',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    public static updateBackstage(
        id: number,
        requestBody: BackstageAdminUpdateRequestDto
    ): CancelablePromise<BackstageAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/backstages/{id}',
            path: { id },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Backstage not found',
            },
        });
    }

    public static deleteBackstage(id: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/backstages/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Backstage not found',
            },
        });
    }

    public static reorderBackstages(
        requestBody: BackstageReorderRequestDto
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/backstages/reorder',
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
