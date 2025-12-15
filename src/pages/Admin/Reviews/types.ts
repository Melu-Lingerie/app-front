export type ReviewStatus = 'moderation' | 'published' | 'hidden';

export interface Review {
    id: number;
    productId: number;
    productName: string;
    reviewText: string;
    rating: number;
    authorId: number;
    authorName: string;
    date: string;
    status: ReviewStatus;
    hasPhoto: boolean;
    photoUrls?: string[];
}

export interface ReviewFilters {
    search?: string;
    productId?: number;
    categoryId?: number;
    rating?: number[];
    dateFrom?: string;
    dateTo?: string;
    hasPhoto?: boolean;
    status?: ReviewStatus;
}
