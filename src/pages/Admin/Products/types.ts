export type ProductStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'NEW' | 'SOON';
export type ProductType = 'STANDARD' | 'SET';

export interface ProductVariantMedia {
    id: number;
    mediaId: number;
    mediaUrl?: string;
    sortOrder: number;
}

export interface ProductVariant {
    id: number;
    colorName?: string;
    size?: string;
    stockQuantity: number;
    isAvailable: boolean;
    price?: number;
    sortOrder: number;
    media: ProductVariantMedia[];
}

export interface Product {
    id: number;
    name: string;
    articleNumber: string;
    slug: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    collectionId?: number;
    collectionName?: string;
    productType: ProductType;
    basePrice?: number;
    promoPrice?: number;
    totalStock: number;
    status: ProductStatus;
    mainMediaId?: number;
    mainMediaUrl?: string;
    material?: string;
    careInstructions?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    variants: ProductVariant[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    articleNumber: string;
    categoryId: number;
    collectionId?: number;
    productType: ProductType;
    basePrice: number;
    promoPrice?: number;
    status: ProductStatus;
    material?: string;
    careInstructions?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    mainMediaId?: number;
    mainMediaUrl?: string;
    variants: ProductVariantFormData[];
}

export interface ProductVariantFormData {
    id?: number;
    colorName?: string;
    size?: string;
    stockQuantity: number;
    isAvailable: boolean;
    price?: number;
    sortOrder: number;
    mediaIds: number[];
    mediaUrls: string[];
}

export interface ProductFilters {
    search?: string;
    status?: ProductStatus[];
    categoryId?: number;
    priceFrom?: number;
    priceTo?: number;
}
