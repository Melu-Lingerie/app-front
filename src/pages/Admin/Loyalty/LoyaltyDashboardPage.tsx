import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Gift, Calendar } from 'lucide-react';
import { AdminHeader, AdminButton } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { AdminLoyaltyDashboardResponse } from '@/api/models/LoyaltyDto';

const TIER_LABELS: Record<string, string> = {
    FIRST_SPOONFUL: 'First Spoonful',
    SWEET_MOMENT: 'Sweet Moment',
    SECRET_PLEASURE: 'Secret Pleasure',
};

export function LoyaltyDashboardPage() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<AdminLoyaltyDashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AdminLoyaltyService.getDashboard()
            .then(setDashboard)
            .finally(() => setIsLoading(false));
    }, []);

    const cards = [
        {
            label: 'Всего аккаунтов',
            value: dashboard?.totalAccounts ?? 0,
            icon: <Users size={24} className="text-blue-500" />,
            onClick: () => navigate('/admin/loyalty/accounts'),
        },
        {
            label: 'Крошек в обороте',
            value: (dashboard?.totalCrumbsInCirculation ?? 0).toFixed(1),
            icon: <Award size={24} className="text-pink-500" />,
        },
        {
            label: TIER_LABELS.FIRST_SPOONFUL,
            value: dashboard?.firstSpoonfulCount ?? 0,
            icon: <span className="w-6 h-6 rounded-full bg-pink-100 inline-block" />,
        },
        {
            label: TIER_LABELS.SWEET_MOMENT,
            value: dashboard?.sweetMomentCount ?? 0,
            icon: <span className="w-6 h-6 rounded-full bg-purple-100 inline-block" />,
        },
        {
            label: TIER_LABELS.SECRET_PLEASURE,
            value: dashboard?.secretPleasureCount ?? 0,
            icon: <span className="w-6 h-6 rounded-full bg-amber-100 inline-block" />,
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Программа лояльности"
                subtitle="Обзор программы крошек"
                actions={
                    <div className="flex gap-2">
                        <AdminButton variant="outline" onClick={() => navigate('/admin/loyalty/settings')}>
                            Настройки
                        </AdminButton>
                    </div>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 ${card.onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors' : ''}`}
                            onClick={card.onClick}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
                                {card.icon}
                            </div>
                            <div className="text-2xl font-semibold dark:text-white">{card.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => navigate('/admin/loyalty/accounts')}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left"
                >
                    <Users size={20} className="text-gray-400" />
                    <div>
                        <div className="font-medium dark:text-white">Аккаунты</div>
                        <div className="text-sm text-gray-500">Управление аккаунтами</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/admin/loyalty/rewards')}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left"
                >
                    <Gift size={20} className="text-gray-400" />
                    <div>
                        <div className="font-medium dark:text-white">Награды</div>
                        <div className="text-sm text-gray-500">Каталог наград</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/admin/loyalty/redemptions')}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left"
                >
                    <Award size={20} className="text-gray-400" />
                    <div>
                        <div className="font-medium dark:text-white">Обмены</div>
                        <div className="text-sm text-gray-500">Обмены наград</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/admin/loyalty/taste-days')}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left"
                >
                    <Calendar size={20} className="text-gray-400" />
                    <div>
                        <div className="font-medium dark:text-white">Дни вкуса</div>
                        <div className="text-sm text-gray-500">Бонусные периоды</div>
                    </div>
                </button>
            </div>
        </div>
    );
}
