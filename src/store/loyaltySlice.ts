import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
    LoyaltyAccountResponse,
    CrumbTransactionResponse,
    LoyaltyRewardResponse,
    ReferralInfoResponse,
} from '@/api/models/LoyaltyDto';
import { LoyaltyService } from '@/api/services/LoyaltyService';
import type { RootState } from './index';

interface LoyaltyState {
    account: LoyaltyAccountResponse | null;
    transactions: CrumbTransactionResponse[];
    transactionsTotal: number;
    rewards: LoyaltyRewardResponse[];
    referralInfo: ReferralInfoResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: LoyaltyState = {
    account: null,
    transactions: [],
    transactionsTotal: 0,
    rewards: [],
    referralInfo: null,
    loading: false,
    error: null,
};

export const fetchLoyaltyAccount = createAsyncThunk(
    'loyalty/fetchAccount',
    async () => LoyaltyService.getAccount()
);

export const fetchTransactions = createAsyncThunk(
    'loyalty/fetchTransactions',
    async ({ page, size }: { page?: number; size?: number } = {}) =>
        LoyaltyService.getTransactions(page, size)
);

export const fetchRewards = createAsyncThunk(
    'loyalty/fetchRewards',
    async () => LoyaltyService.getRewards()
);

export const fetchReferralInfo = createAsyncThunk(
    'loyalty/fetchReferralInfo',
    async () => LoyaltyService.getReferralInfo()
);

export const redeemDiscount = createAsyncThunk(
    'loyalty/redeemDiscount',
    async () => LoyaltyService.redeemDiscount()
);

export const redeemReward = createAsyncThunk(
    'loyalty/redeemReward',
    async (rewardId: number) => {
        await LoyaltyService.redeemReward(rewardId);
        return rewardId;
    }
);

const loyaltySlice = createSlice({
    name: 'loyalty',
    initialState,
    reducers: {
        clearLoyalty: () => initialState,
    },
    extraReducers: (builder) => {
        // Account
        builder
            .addCase(fetchLoyaltyAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLoyaltyAccount.fulfilled, (state, action) => {
                state.account = action.payload;
                state.loading = false;
            })
            .addCase(fetchLoyaltyAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Failed to load loyalty account';
            });

        // Transactions
        builder
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.transactions = action.payload.content;
                state.transactionsTotal = action.payload.totalElements;
            });

        // Rewards
        builder
            .addCase(fetchRewards.fulfilled, (state, action) => {
                state.rewards = action.payload;
            });

        // Referral
        builder
            .addCase(fetchReferralInfo.fulfilled, (state, action) => {
                state.referralInfo = action.payload;
            });

        // Redeem discount - refresh account after
        builder
            .addCase(redeemDiscount.fulfilled, () => {
                // Account will be refreshed separately
            });
    },
});

export const { clearLoyalty } = loyaltySlice.actions;
export default loyaltySlice.reducer;

// Selectors
export const selectLoyaltyAccount = (state: RootState) => state.loyalty.account;
export const selectLoyaltyBalance = (state: RootState) => state.loyalty.account?.crumbsBalance ?? 0;
export const selectLoyaltyLoading = (state: RootState) => state.loyalty.loading;
export const selectLoyaltyTransactions = (state: RootState) => state.loyalty.transactions;
export const selectLoyaltyRewards = (state: RootState) => state.loyalty.rewards;
export const selectReferralInfo = (state: RootState) => state.loyalty.referralInfo;
