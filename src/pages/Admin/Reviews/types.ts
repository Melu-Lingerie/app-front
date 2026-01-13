export interface Review {
    id: string; // UUID
    productId: number;
    productName: string;
    userId: number;
    reviewerName: string;
    rating: number;
    reviewText: string;
    isVerifiedPurchase: boolean;
    isApproved: boolean | null; // null = pending, true = approved, false = rejected
    createdAt: string;
}

// Computed status based on isApproved
export type ReviewStatus = 'moderation' | 'published' | 'hidden';

export function getReviewStatus(review: Review): ReviewStatus {
    if (review.isApproved === null) return 'moderation';
    if (review.isApproved === true) return 'published';
    return 'hidden';
}
