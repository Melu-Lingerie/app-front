import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

// Types
export type ProductStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'NEW' | 'SOON';
export type ProductType = 'STANDARD' | 'SET';

export type ProductAdminListItemDto = {
    id: number;
    name: string;
    articleNumber: string;
    categoryName?: string;
    basePrice?: number;
    promoPrice?: number;
    status: ProductStatus;
    productType: ProductType;
    totalStock: number;
    mainMediaUrl?: string;
    createdAt: string;
    updatedAt: string;
};

export type ProductVariantMediaDto = {
    id: number;
    mediaId: number;
    mediaUrl?: string;
    sortOrder: number;
};

export type ProductVariantAdminResponseDto = {
    id: number;
    colorName?: string;
    size?: string;
    stockQuantity: number;
    isAvailable: boolean;
    price?: number;
    sortOrder: number;
    media: ProductVariantMediaDto[];
};

export type ProductAdminResponseDto = {
    id: number;
    name: string;
    articleNumber: string;
    slug: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    collectionId?: number;
    collectionName?: string;
    basePrice?: number;
    promoPrice?: number;
    material?: string;
    careInstructions?: string;
    status: ProductStatus;
    productType: ProductType;
    mainMediaId?: number;
    mainMediaUrl?: string;
    score?: number;
    totalStock: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    variants: ProductVariantAdminResponseDto[];
    createdAt: string;
    updatedAt: string;
};

export type PageProductAdminListItemDto = {
    content: ProductAdminListItemDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export type ProductVariantCreateRequestDto = {
    colorName?: string;
    size?: string;
    stockQuantity: number;
    priceId?: number;
    sortOrder?: number;
    mediaIds?: number[];
};

export type ProductAdminCreateRequestDto = {
    name: string;
    articleNumber?: string;
    description?: string;
    categoryId?: number;
    collectionId?: number;
    basePriceId?: number;
    material?: string;
    careInstructions?: string;
    status?: ProductStatus;
    productType?: ProductType;
    mainMediaId?: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    variants?: ProductVariantCreateRequestDto[];
};

export type ProductVariantUpdateRequestDto = {
    id?: number;
    colorName?: string;
    size?: string;
    stockQuantity?: number;
    priceId?: number;
    sortOrder?: number;
    mediaIds?: number[];
};

export type ProductAdminUpdateRequestDto = {
    name?: string;
    articleNumber?: string;
    description?: string;
    categoryId?: number;
    collectionId?: number;
    basePriceId?: number;
    material?: string;
    careInstructions?: string;
    status?: ProductStatus;
    productType?: ProductType;
    mainMediaId?: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    variants?: ProductVariantUpdateRequestDto[];
};

export class AdminProductService {
    /**
     * Search products with filters
     */
    public static searchProducts(
        params: {
            name?: string;
            categoryIds?: number[];
            status?: ProductStatus;
            minPrice?: number;
            maxPrice?: number;
            page?: number;
            size?: number;
        } = {}
    ): CancelablePromise<PageProductAdminListItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/products',
            query: {
                name: params.name,
                categoryIds: params.categoryIds,
                status: params.status,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
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
     * Get product by ID
     */
    public static getProduct(productId: number): CancelablePromise<ProductAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/products/{productId}',
            path: { productId },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Product not found',
            },
        });
    }

    /**
     * Create product
     */
    public static createProduct(
        requestBody: ProductAdminCreateRequestDto
    ): CancelablePromise<ProductAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/products',
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
     * Update product
     */
    public static updateProduct(
        productId: number,
        requestBody: ProductAdminUpdateRequestDto
    ): CancelablePromise<ProductAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/products/{productId}',
            path: { productId },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Product not found',
            },
        });
    }

    /**
     * Delete product
     */
    public static deleteProduct(productId: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/products/{productId}',
            path: { productId },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Product not found',
            },
        });
    }
}
