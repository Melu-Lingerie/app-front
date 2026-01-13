export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface PromoCode {
    id: number;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    usedCount: number;
    maxUsesPerUser?: number;
    validFrom?: string;
    validTo?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PromoCodeFormData {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
}

// Computed status based on dates and isActive
export type PromoCodeStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export function getPromoCodeStatus(promo: PromoCode): PromoCodeStatus {
    if (!promo.isActive) return 'inactive';

    const now = new Date();
    const validFrom = promo.validFrom ? new Date(promo.validFrom) : null;
    const validTo = promo.validTo ? new Date(promo.validTo) : null;

    if (validFrom && now < validFrom) return 'scheduled';
    if (validTo && now > validTo) return 'expired';

    return 'active';
}
