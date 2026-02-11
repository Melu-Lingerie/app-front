import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type CategoryAdminResponseDto = {
    id: number;
    name: string;
    slug: string;
    parentId?: number;
    parentName?: string;
    sortOrder?: number;
    isActive?: boolean;
    children?: CategoryAdminResponseDto[];
};

export class AdminCategoryService {
    /**
     * Get all categories (flat list)
     */
    public static getAllCategories(): CancelablePromise<CategoryAdminResponseDto[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/categories',
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Get category tree (hierarchical)
     */
    public static getCategoryTree(): CancelablePromise<CategoryAdminResponseDto[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/categories/tree',
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }
}
