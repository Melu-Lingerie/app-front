import type {
    LoyaltyAccountResponse,
    CrumbTransactionResponse,
    LoyaltyRewardResponse,
    ReferralInfoResponse,
    RedeemDiscountResponse,
    PageResponse,
} from '../models/LoyaltyDto';
import api from '@/axios/api';

export class LoyaltyService {
    static async getAccount(): Promise<LoyaltyAccountResponse> {
        const { data } = await api.get('/loyalty/account');
        return data;
    }

    static async getTransactions(page = 0, size = 10): Promise<PageResponse<CrumbTransactionResponse>> {
        const { data } = await api.get('/loyalty/transactions', { params: { page, size } });
        return data;
    }

    static async getRewards(): Promise<LoyaltyRewardResponse[]> {
        const { data } = await api.get('/loyalty/rewards');
        return data;
    }

    static async redeemReward(rewardId: number): Promise<void> {
        await api.post(`/loyalty/rewards/${rewardId}/redeem`);
    }

    static async redeemDiscount(): Promise<RedeemDiscountResponse> {
        const { data } = await api.post('/loyalty/redeem-discount');
        return data;
    }

    static async getReferralInfo(): Promise<ReferralInfoResponse> {
        const { data } = await api.get('/loyalty/referral');
        return data;
    }

    static async applyReferralCode(code: string): Promise<void> {
        await api.post('/loyalty/referral/apply', { code });
    }
}
