export type LoyaltyTier = 'FIRST_SPOONFUL' | 'SWEET_MOMENT' | 'SECRET_PLEASURE';

export type CrumbTransactionType =
    | 'PURCHASE_EARN'
    | 'MULTI_ITEM_BONUS'
    | 'SECRET_BOX_BONUS'
    | 'TASTE_DAYS_BONUS'
    | 'REVIEW_BONUS'
    | 'UGC_BONUS'
    | 'REFERRAL_BONUS'
    | 'SUBSCRIPTION_BONUS'
    | 'BIRTHDAY_BONUS'
    | 'MANUAL_ADJUSTMENT'
    | 'REDEMPTION'
    | 'GIFT_EXCHANGE'
    | 'EXPIRATION';

export type RedemptionStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED';

export type LoyaltyAccountResponse = {
    id: number;
    userId: number;
    tier: LoyaltyTier;
    crumbsBalance: number;
    crumbsTotalEarned: number;
    spendAmount6m: number;
    spendAmount12m: number;
    referralCode: string;
    nextTierThreshold: number | null;
    nextTierProgress: number | null;
    nextTierName: string | null;
    createdAt: string;
};

export type CrumbTransactionResponse = {
    id: number;
    amount: number;
    balanceAfter: number;
    type: CrumbTransactionType;
    description: string;
    expiresAt: string | null;
    createdAt: string;
};

export type LoyaltyRewardResponse = {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    crumbsCost: number;
    minTier: LoyaltyTier;
    stock: number | null;
    isActive: boolean;
};

export type ReferralInfoResponse = {
    referralCode: string;
    totalReferrals: number;
    completedReferrals: number;
};

export type RedeemDiscountResponse = {
    promoCode: string;
    discountPercent: number;
    message: string;
};

export type RewardRedemptionResponse = {
    id: number;
    loyaltyAccountId: number;
    rewardId: number;
    rewardName: string;
    crumbsSpent: number;
    status: RedemptionStatus;
    createdAt: string;
};

export type AdminLoyaltyDashboardResponse = {
    totalAccounts: number;
    totalCrumbsInCirculation: number;
    firstSpoonfulCount: number;
    sweetMomentCount: number;
    secretPleasureCount: number;
};

export type LoyaltySettingResponse = {
    id: number;
    key: string;
    value: string;
    description: string;
    updatedAt: string;
};

export type TasteDayResponse = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    bonusPercent: number;
    isActive: boolean;
    createdAt: string;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};
