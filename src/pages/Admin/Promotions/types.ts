export type PromotionType = 'internal' | 'for_client';
export type DiscountType = 'percent' | 'fixed_amount' | 'gift';
export type PromotionStatus = 'active' | 'scheduled' | 'completed' | 'paused';
export type PromotionScope = 'all_order' | 'categories' | 'products';
export type CustomerGroup = 'all' | 'new_only';

export interface PromoCode {
    id: number;
    code: string;
    promotionId: number;
    promotionName: string;
    status: 'active' | 'inactive';
    usedCount: number;
}

export interface Promotion {
    id: number;
    name: string;
    type: PromotionType;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    scope: PromotionScope;
    customerGroup: CustomerGroup;
    usageLimitTotal?: number;
    usageLimitPerCustomer?: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    status: PromotionStatus;
}

export interface LoyaltySettings {
    percentFromOrder: number;
    minOrderAmount: number;
    pointsValidityDays: number;
    pointsToRubleRate: number;
}

export interface PromotionFormData {
    name: string;
    type: PromotionType;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    scope: PromotionScope;
    customerGroup: CustomerGroup;
    usageLimitTotal?: number;
    usageLimitPerCustomer?: number;
    startDate: string;
    endDate: string;
    status: PromotionStatus;
    promoCodes: { code: string; usageLimit?: number }[];
}
