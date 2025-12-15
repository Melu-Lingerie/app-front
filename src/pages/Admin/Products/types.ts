export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type ProductType = 'bustier' | 'panties' | 'body' | 'set';

export interface ProductVariant {
    id: number;
    colorName: string;
    size: string;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface Product {
    id: number;
    name: string;
    articleNumber: string;
    slug: string;
    description: string;
    categoryId: number;
    categoryName: string;
    collectionId?: number;
    collectionName?: string;
    productType: ProductType;
    basePrice: number;
    promoPrice?: number;
    stockQuantity: number;
    status: ProductStatus;
    mainImageUrl?: string;
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
    stockQuantity: number;
    status: ProductStatus;
    material?: string;
    careInstructions?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    colors: string[];
    sizes: string[];
    mainPhotos: File[];
    additionalPhotos: File[];
    relatedProductIds: number[];
    accessoryProductIds: number[];
}

export interface ProductFilters {
    search?: string;
    status?: ProductStatus[];
    categoryId?: number;
    priceFrom?: number;
    priceTo?: number;
}
