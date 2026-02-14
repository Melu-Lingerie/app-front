import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AppDispatch } from '@/store';
import {
    fetchRewards,
    fetchLoyaltyAccount,
    redeemReward,
    selectLoyaltyRewards,
    selectLoyaltyAccount,
} from '@/store/loyaltySlice';
import type { LoyaltyRewardResponse, LoyaltyTier } from '@/api/models/LoyaltyDto';

const TIER_LABELS: Record<LoyaltyTier, string> = {
    FIRST_SPOONFUL: 'First Spoonful',
    SWEET_MOMENT: 'Sweet Moment',
    SECRET_PLEASURE: 'Secret Pleasure',
};

export const LoyaltyRewardsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const rewards = useSelector(selectLoyaltyRewards);
    const account = useSelector(selectLoyaltyAccount);
    const [redeemingId, setRedeemingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchRewards());
        dispatch(fetchLoyaltyAccount());
    }, [dispatch]);

    const handleRedeem = async (reward: LoyaltyRewardResponse) => {
        setRedeemingId(reward.id);
        try {
            await dispatch(redeemReward(reward.id)).unwrap();
            dispatch(fetchLoyaltyAccount());
            dispatch(fetchRewards());
        } catch {
            // error handled in slice
        } finally {
            setRedeemingId(null);
        }
    };

    const balance = account?.crumbsBalance ?? 0;
    const tierIndex = account ? ['FIRST_SPOONFUL', 'SWEET_MOMENT', 'SECRET_PLEASURE'].indexOf(account.tier) : 0;

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            <Link to="/account/loyalty" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft size={16} />
                Назад к программе лояльности
            </Link>

            <h1 className="text-2xl font-semibold uppercase mb-2">Каталог наград</h1>
            <p className="text-sm text-gray-500 mb-8">
                Ваш баланс: <span className="font-medium text-black dark:text-white">{balance.toFixed(1)} крошек</span>
            </p>

            {rewards.length === 0 ? (
                <div className="text-center py-16 text-gray-400">Награды пока недоступны</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => {
                        const rewardTierIndex = ['FIRST_SPOONFUL', 'SWEET_MOMENT', 'SECRET_PLEASURE'].indexOf(reward.minTier);
                        const canAfford = balance >= reward.crumbsCost;
                        const hasRequiredTier = tierIndex >= rewardTierIndex;
                        const canRedeem = canAfford && hasRequiredTier && (reward.stock === null || reward.stock > 0);

                        return (
                            <div
                                key={reward.id}
                                className="bg-[#FFFBF5] dark:bg-white/5 rounded-xl border border-[#F8C6D7]/30 overflow-hidden"
                            >
                                {reward.imageUrl && (
                                    <img
                                        src={reward.imageUrl}
                                        alt={reward.name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-5">
                                    <h3 className="font-medium mb-1">{reward.name}</h3>
                                    {reward.description && (
                                        <p className="text-sm text-gray-500 mb-3">{reward.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-semibold">{reward.crumbsCost} крошек</span>
                                        {reward.minTier !== 'FIRST_SPOONFUL' && (
                                            <span className="text-xs text-gray-400">
                                                от {TIER_LABELS[reward.minTier]}
                                            </span>
                                        )}
                                    </div>
                                    {reward.stock !== null && reward.stock <= 5 && (
                                        <div className="text-xs text-orange-500 mb-2">
                                            Осталось: {reward.stock}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRedeem(reward)}
                                        disabled={!canRedeem || redeemingId === reward.id}
                                        className="w-full py-2.5 bg-[#F8C6D7] text-black rounded-lg font-medium text-sm uppercase hover:bg-[#f0b0c5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {redeemingId === reward.id ? 'Обмен...' : 'Обменять'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
