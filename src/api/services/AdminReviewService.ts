import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

// Types
export type ReviewAdminResponseDto = {
    id: string; // UUID
    productId: number;
    productName: string;
    userId: number;
    reviewerName: string;
    rating: number;
    reviewText: string;
    isVerifiedPurchase: boolean;
    isApproved: boolean | null;
    createdAt: string;
};

export type PageReviewAdminResponseDto = {
    content: ReviewAdminResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export class AdminReviewService {
    /**
     * Search reviews with filters
     */
    public static searchReviews(
        params: {
            isApproved?: boolean;
            productId?: number;
            search?: string;
            page?: number;
            size?: number;
        } = {}
    ): CancelablePromise<PageReviewAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/reviews',
            query: {
                isApproved: params.isApproved,
                productId: params.productId,
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
     * Get review by ID
     */
    public static getReview(id: string): CancelablePromise<ReviewAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/reviews/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Review not found',
            },
        });
    }

    /**
     * Approve review
     */
    public static approveReview(id: string): CancelablePromise<ReviewAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/reviews/{id}/approve',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Review not found',
            },
        });
    }

    /**
     * Reject review
     */
    public static rejectReview(id: string): CancelablePromise<ReviewAdminResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/reviews/{id}/reject',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Review not found',
            },
        });
    }

    /**
     * Delete review
     */
    public static deleteReview(id: string): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/reviews/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Review not found',
            },
        });
    }

    /**
     * Get count of pending reviews
     */
    public static countPendingReviews(): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/reviews/pending-count',
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }
}
