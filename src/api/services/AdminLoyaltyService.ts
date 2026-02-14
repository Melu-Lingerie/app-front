import type {
    LoyaltyAccountResponse,
    LoyaltyRewardResponse,
    RewardRedemptionResponse,
    AdminLoyaltyDashboardResponse,
    LoyaltySettingResponse,
    TasteDayResponse,
    LoyaltyTier,
    PageResponse,
} from '../models/LoyaltyDto';
import api from '@/axios/api';

export class AdminLoyaltyService {
    // Dashboard
    static async getDashboard(): Promise<AdminLoyaltyDashboardResponse> {
        const { data } = await api.get('/admin/loyalty/dashboard');
        return data;
    }

    // Accounts
    static async getAccounts(page = 0, size = 20): Promise<PageResponse<LoyaltyAccountResponse>> {
        const { data } = await api.get('/admin/loyalty/accounts', { params: { page, size } });
        return data;
    }

    static async getAccount(id: number): Promise<LoyaltyAccountResponse> {
        const { data } = await api.get(`/admin/loyalty/accounts/${id}`);
        return data;
    }

    static async adjustCrumbs(id: number, amount: number, description: string): Promise<void> {
        await api.post(`/admin/loyalty/accounts/${id}/adjust`, { amount, description });
    }

    static async updateTier(id: number, tier: LoyaltyTier): Promise<void> {
        await api.put(`/admin/loyalty/accounts/${id}/tier`, { tier });
    }

    static async awardUgcBonus(id: number): Promise<void> {
        await api.post(`/admin/loyalty/accounts/${id}/ugc-bonus`);
    }

    // Rewards
    static async getRewards(): Promise<LoyaltyRewardResponse[]> {
        const { data } = await api.get('/admin/loyalty/rewards');
        return data;
    }

    static async createReward(reward: {
        name: string;
        description?: string;
        imageUrl?: string;
        crumbsCost: number;
        minTier?: LoyaltyTier;
        stock?: number;
        isActive?: boolean;
    }): Promise<LoyaltyRewardResponse> {
        const { data } = await api.post('/admin/loyalty/rewards', reward);
        return data;
    }

    static async updateReward(id: number, reward: {
        name?: string;
        description?: string;
        imageUrl?: string;
        crumbsCost?: number;
        minTier?: LoyaltyTier;
        stock?: number;
        isActive?: boolean;
    }): Promise<LoyaltyRewardResponse> {
        const { data } = await api.put(`/admin/loyalty/rewards/${id}`, reward);
        return data;
    }

    static async deleteReward(id: number): Promise<void> {
        await api.delete(`/admin/loyalty/rewards/${id}`);
    }

    // Redemptions
    static async getRedemptions(page = 0, size = 20): Promise<PageResponse<RewardRedemptionResponse>> {
        const { data } = await api.get('/admin/loyalty/redemptions', { params: { page, size } });
        return data;
    }

    static async fulfillRedemption(id: number): Promise<void> {
        await api.post(`/admin/loyalty/redemptions/${id}/fulfill`);
    }

    // Taste Days
    static async getTasteDays(): Promise<TasteDayResponse[]> {
        const { data } = await api.get('/admin/loyalty/taste-days');
        return data;
    }

    static async createTasteDay(tasteDay: {
        name: string;
        startDate: string;
        endDate: string;
        bonusPercent?: number;
        isActive?: boolean;
    }): Promise<TasteDayResponse> {
        const { data } = await api.post('/admin/loyalty/taste-days', tasteDay);
        return data;
    }

    static async updateTasteDay(id: number, tasteDay: {
        name?: string;
        startDate?: string;
        endDate?: string;
        bonusPercent?: number;
        isActive?: boolean;
    }): Promise<TasteDayResponse> {
        const { data } = await api.put(`/admin/loyalty/taste-days/${id}`, tasteDay);
        return data;
    }

    static async deleteTasteDay(id: number): Promise<void> {
        await api.delete(`/admin/loyalty/taste-days/${id}`);
    }

    // Settings
    static async getSettings(): Promise<LoyaltySettingResponse[]> {
        const { data } = await api.get('/admin/loyalty/settings');
        return data;
    }

    static async updateSetting(key: string, value: string): Promise<LoyaltySettingResponse> {
        const { data } = await api.put('/admin/loyalty/settings', { key, value });
        return data;
    }
}
