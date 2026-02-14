import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Copy, Gift, Share2, ChevronRight } from 'lucide-react';
import type { AppDispatch } from '@/store';
import {
    fetchLoyaltyAccount,
    fetchTransactions,
    fetchReferralInfo,
    redeemDiscount,
    selectLoyaltyAccount,
    selectLoyaltyLoading,
    selectLoyaltyTransactions,
    selectReferralInfo,
} from '@/store/loyaltySlice';
import type { CrumbTransactionType } from '@/api/models/LoyaltyDto';

const TIER_LABELS: Record<string, string> = {
    FIRST_SPOONFUL: 'First Spoonful',
    SWEET_MOMENT: 'Sweet Moment',
    SECRET_PLEASURE: 'Secret Pleasure',
};

const TIER_COLORS: Record<string, string> = {
    FIRST_SPOONFUL: 'bg-pink-100 text-pink-700',
    SWEET_MOMENT: 'bg-purple-100 text-purple-700',
    SECRET_PLEASURE: 'bg-amber-100 text-amber-800',
};

const TX_TYPE_LABELS: Record<CrumbTransactionType, string> = {
    PURCHASE_EARN: 'Покупка',
    MULTI_ITEM_BONUS: 'Бонус за несколько позиций',
    SECRET_BOX_BONUS: 'Secret Box бонус',
    TASTE_DAYS_BONUS: 'Дни вкуса',
    REVIEW_BONUS: 'Отзыв',
    UGC_BONUS: 'UGC-контент',
    REFERRAL_BONUS: 'Реферальный бонус',
    SUBSCRIPTION_BONUS: 'Подписка',
    BIRTHDAY_BONUS: 'День рождения',
    MANUAL_ADJUSTMENT: 'Корректировка',
    REDEMPTION: 'Обмен на скидку',
    GIFT_EXCHANGE: 'Обмен на подарок',
    EXPIRATION: 'Истечение срока',
};

export const LoyaltyTab = () => {
    const dispatch = useDispatch<AppDispatch>();
    const account = useSelector(selectLoyaltyAccount);
    const loading = useSelector(selectLoyaltyLoading);
    const transactions = useSelector(selectLoyaltyTransactions);
    const referralInfo = useSelector(selectReferralInfo);
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [redeemResult, setRedeemResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        dispatch(fetchLoyaltyAccount());
        dispatch(fetchTransactions({}));
        dispatch(fetchReferralInfo());
    }, [dispatch]);

    const handleRedeemDiscount = async () => {
        setRedeemLoading(true);
        setRedeemResult(null);
        try {
            const result = await dispatch(redeemDiscount()).unwrap();
            setRedeemResult(`Промокод: ${result.promoCode}. ${result.message}`);
            dispatch(fetchLoyaltyAccount());
        } catch {
            setRedeemResult('Не удалось обменять крошки');
        } finally {
            setRedeemLoading(false);
        }
    };

    const copyReferralCode = () => {
        if (account?.referralCode) {
            navigator.clipboard.writeText(account.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareReferralCode = () => {
        if (account?.referralCode && navigator.share) {
            navigator.share({
                title: 'Melu Lingerie',
                text: `Используй мой реферальный код ${account.referralCode} и получи бонусные крошки!`,
            });
        }
    };

    if (loading && !account) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-white/5 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    const balance = account?.crumbsBalance ?? 0;
    const tier = account?.tier ?? 'FIRST_SPOONFUL';
    const progress = account?.nextTierProgress ?? 0;
    const threshold = account?.nextTierThreshold ?? 0;
    const progressPercent = threshold > 0 ? Math.min((progress / threshold) * 100, 100) : 100;

    return (
        <div className="space-y-8">
            {/* Tier & Balance */}
            <div className="flex gap-6">
                <div className="flex-1 bg-[#FFFBF5] dark:bg-white/5 rounded-xl p-6 border border-[#F8C6D7]/30">
                    <div className="text-sm text-gray-500 uppercase mb-1">Ваш уровень</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${TIER_COLORS[tier]}`}>
                        {TIER_LABELS[tier]}
                    </div>
                    {account?.nextTierName && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>До {account.nextTierName}</span>
                                <span>{Math.round(progress).toLocaleString()} / {Math.round(threshold).toLocaleString()} &#8381;</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#F8C6D7] rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-1 bg-[#FFFBF5] dark:bg-white/5 rounded-xl p-6 border border-[#F8C6D7]/30">
                    <div className="text-sm text-gray-500 uppercase mb-1">Баланс крошек</div>
                    <div className="text-3xl font-semibold">{balance.toFixed(1)}</div>
                    <div className="text-xs text-gray-400 mt-1">крошек</div>
                </div>
            </div>

            {/* Redeem Button */}
            <div className="bg-[#FFFBF5] dark:bg-white/5 rounded-xl p-6 border border-[#F8C6D7]/30">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Обменять 10 крошек на скидку 10%</div>
                        <div className="text-sm text-gray-500 mt-1">Получите одноразовый промокод на 24 часа</div>
                    </div>
                    <button
                        onClick={handleRedeemDiscount}
                        disabled={balance < 10 || redeemLoading}
                        className="px-5 py-2.5 bg-[#F8C6D7] text-black rounded-lg font-medium text-sm uppercase hover:bg-[#f0b0c5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {redeemLoading ? 'Обмен...' : 'Обменять'}
                    </button>
                </div>
                {redeemResult && (
                    <div className="mt-3 text-sm p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                        {redeemResult}
                    </div>
                )}
            </div>

            {/* Referral */}
            <div className="bg-[#FFFBF5] dark:bg-white/5 rounded-xl p-6 border border-[#F8C6D7]/30">
                <div className="font-medium mb-3">Реферальная программа</div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 dark:bg-white/10 rounded-lg px-4 py-2.5 font-mono text-sm">
                        {account?.referralCode ?? '...'}
                    </div>
                    <button
                        onClick={copyReferralCode}
                        className="p-2.5 border border-[#CCC] dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        title="Копировать"
                    >
                        <Copy size={16} />
                    </button>
                    {'share' in navigator && (
                        <button
                            onClick={shareReferralCode}
                            className="p-2.5 border border-[#CCC] dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            title="Поделиться"
                        >
                            <Share2 size={16} />
                        </button>
                    )}
                </div>
                {copied && <div className="text-xs text-green-600 mt-2">Скопировано!</div>}
                {referralInfo && (
                    <div className="flex gap-6 mt-4 text-sm text-gray-500">
                        <span>Приглашено: {referralInfo.totalReferrals}</span>
                        <span>Покупок: {referralInfo.completedReferrals}</span>
                    </div>
                )}
            </div>

            {/* Rewards Link */}
            <Link
                to="/loyalty/rewards"
                className="flex items-center justify-between bg-[#FFFBF5] dark:bg-white/5 rounded-xl p-6 border border-[#F8C6D7]/30 hover:border-[#F8C6D7] transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <Gift size={20} className="text-[#F8C6D7]" />
                    <span className="font-medium">Каталог наград</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>

            {/* Recent Transactions */}
            <div>
                <div className="font-medium mb-4 uppercase text-sm">Последние операции</div>
                {transactions.length === 0 ? (
                    <div className="text-sm text-gray-400 py-4">Нет операций</div>
                ) : (
                    <div className="space-y-2">
                        {transactions.slice(0, 10).map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5"
                            >
                                <div>
                                    <div className="text-sm">{TX_TYPE_LABELS[tx.type] ?? tx.type}</div>
                                    {tx.description && (
                                        <div className="text-xs text-gray-400 mt-0.5">{tx.description}</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
