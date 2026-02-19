import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type ReviewResponseDto = {
    id: string;
    userId: number;
    reviewerName: string | null;
    rating: number;
    reviewText: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
};

export type PageReviewResponseDto = {
    content: ReviewResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export type ReviewCreateRequest = {
    rating: number;
    reviewText: string;
    reviewerName?: string;
};

export class ReviewService {
    /**
     * Get approved reviews for a product
     */
    public static getProductReviews(
        productId: number,
        params: { page?: number; size?: number } = {}
    ): CancelablePromise<PageReviewResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{productId}/reviews',
            path: { productId },
            query: {
                page: params.page ?? 0,
                size: params.size ?? 5,
            },
        });
    }

    /**
     * Create a review for a product (requires auth)
     */
    public static createReview(
        productId: number,
        body: ReviewCreateRequest
    ): CancelablePromise<ReviewResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/{productId}/reviews',
            path: { productId },
            body,
            errors: {
                401: 'Unauthorized',
                400: 'Bad request',
            },
        });
    }
}
