import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminHeader, AdminButton, AdminInput, AdminSelect, AdminBadge } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { LoyaltyAccountResponse, LoyaltyTier } from '@/api/models/LoyaltyDto';

const TIER_LABELS: Record<LoyaltyTier, string> = {
    FIRST_SPOONFUL: 'First Spoonful',
    SWEET_MOMENT: 'Sweet Moment',
    SECRET_PLEASURE: 'Secret Pleasure',
};

const TIER_OPTIONS = [
    { value: 'FIRST_SPOONFUL', label: 'First Spoonful' },
    { value: 'SWEET_MOMENT', label: 'Sweet Moment' },
    { value: 'SECRET_PLEASURE', label: 'Secret Pleasure' },
];

export function LoyaltyAccountDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [account, setAccount] = useState<LoyaltyAccountResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Adjustment form
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustDescription, setAdjustDescription] = useState('');
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [adjustResult, setAdjustResult] = useState<string | null>(null);

    // Tier change
    const [newTier, setNewTier] = useState<LoyaltyTier | ''>('');
    const [isChangingTier, setIsChangingTier] = useState(false);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            AdminLoyaltyService.getAccount(Number(id))
                .then((data) => {
                    setAccount(data);
                    setNewTier(data.tier);
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const handleAdjust = async () => {
        if (!id || !adjustAmount) return;
        setIsAdjusting(true);
        setAdjustResult(null);
        try {
            await AdminLoyaltyService.adjustCrumbs(Number(id), parseFloat(adjustAmount), adjustDescription);
            setAdjustResult('Корректировка выполнена');
            setAdjustAmount('');
            setAdjustDescription('');
            const updated = await AdminLoyaltyService.getAccount(Number(id));
            setAccount(updated);
        } catch {
            setAdjustResult('Ошибка корректировки');
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleTierChange = async () => {
        if (!id || !newTier) return;
        setIsChangingTier(true);
        try {
            await AdminLoyaltyService.updateTier(Number(id), newTier as LoyaltyTier);
            const updated = await AdminLoyaltyService.getAccount(Number(id));
            setAccount(updated);
        } finally {
            setIsChangingTier(false);
        }
    };

    const handleUgcBonus = async () => {
        if (!id) return;
        try {
            await AdminLoyaltyService.awardUgcBonus(Number(id));
            const updated = await AdminLoyaltyService.getAccount(Number(id));
            setAccount(updated);
        } catch {
            // ignore
        }
    };

    if (isLoading) {
        return (
            <div>
                <AdminHeader title="Загрузка..." subtitle="" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div>
                <AdminHeader title="Аккаунт не найден" subtitle="" />
            </div>
        );
    }

    return (
        <div>
            <AdminHeader
                title={`Аккаунт #${account.id}`}
                subtitle={`User ID: ${account.userId} | ${TIER_LABELS[account.tier]}`}
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/loyalty/accounts')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <div className="space-y-6">
                {/* Account Info */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Информация</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Баланс</div>
                            <div className="text-xl font-semibold dark:text-white">{account.crumbsBalance.toFixed(1)} крошек</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Всего заработано</div>
                            <div className="text-xl font-semibold dark:text-white">{account.crumbsTotalEarned.toFixed(1)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Расходы за 6 мес.</div>
                            <div className="text-xl font-semibold dark:text-white">{Math.round(account.spendAmount6m).toLocaleString()} &#8381;</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Расходы за 12 мес.</div>
                            <div className="text-xl font-semibold dark:text-white">{Math.round(account.spendAmount12m).toLocaleString()} &#8381;</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Реферальный код</div>
                            <div className="font-mono dark:text-white">{account.referralCode}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Создан</div>
                            <div className="dark:text-white">{new Date(account.createdAt).toLocaleDateString('ru-RU')}</div>
                        </div>
                    </div>
                </section>

                {/* Tier Change */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Изменить уровень</h2>
                    <div className="flex items-end gap-4">
                        <AdminSelect
                            label="Уровень"
                            options={TIER_OPTIONS}
                            value={newTier}
                            onChange={(e) => setNewTier(e.target.value as LoyaltyTier)}
                        />
                        <AdminButton onClick={handleTierChange} disabled={isChangingTier || newTier === account.tier}>
                            {isChangingTier ? 'Сохранение...' : 'Сохранить'}
                        </AdminButton>
                    </div>
                </section>

                {/* Manual Adjustment */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Ручная корректировка крошек</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <AdminInput
                            label="Количество (+ или -)"
                            type="number"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            placeholder="Например: 5 или -3"
                        />
                        <AdminInput
                            label="Описание"
                            value={adjustDescription}
                            onChange={(e) => setAdjustDescription(e.target.value)}
                            placeholder="Причина корректировки"
                        />
                        <AdminButton onClick={handleAdjust} disabled={isAdjusting || !adjustAmount}>
                            {isAdjusting ? 'Выполнение...' : 'Выполнить'}
                        </AdminButton>
                    </div>
                    {adjustResult && (
                        <div className="mt-3 text-sm text-green-600 dark:text-green-400">{adjustResult}</div>
                    )}
                </section>

                {/* UGC Bonus */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">UGC-бонус</h2>
                    <p className="text-sm text-gray-500 mb-3">Начислить 1.5 крошки за пользовательский контент</p>
                    <AdminButton onClick={handleUgcBonus}>Начислить UGC-бонус</AdminButton>
                </section>
            </div>
        </div>
    );
}
