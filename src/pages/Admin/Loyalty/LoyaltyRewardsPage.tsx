import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { AdminHeader, AdminButton, AdminTable, AdminBadge } from '../components';
import type { Column } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { LoyaltyRewardResponse, LoyaltyTier } from '@/api/models/LoyaltyDto';

const TIER_LABELS: Record<LoyaltyTier, string> = {
    FIRST_SPOONFUL: 'First Spoonful',
    SWEET_MOMENT: 'Sweet Moment',
    SECRET_PLEASURE: 'Secret Pleasure',
};

export function LoyaltyRewardsPage() {
    const navigate = useNavigate();
    const [rewards, setRewards] = useState<LoyaltyRewardResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRewards = async () => {
        setIsLoading(true);
        try {
            const data = await AdminLoyaltyService.getRewards();
            setRewards(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить награду?')) return;
        await AdminLoyaltyService.deleteReward(id);
        fetchRewards();
    };

    const columns: Column<LoyaltyRewardResponse>[] = [
        {
            key: 'id',
            title: 'ID',
            width: '60px',
            render: (item) => <span className="text-gray-500">#{item.id}</span>,
        },
        {
            key: 'image',
            title: '',
            width: '60px',
            render: (item) =>
                item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700" />
                ),
        },
        {
            key: 'name',
            title: 'Название',
            render: (item) => <span className="font-medium dark:text-white">{item.name}</span>,
        },
        {
            key: 'crumbsCost',
            title: 'Стоимость',
            render: (item) => <span>{item.crumbsCost} крошек</span>,
        },
        {
            key: 'minTier',
            title: 'Мин. уровень',
            render: (item) => <span className="text-sm">{TIER_LABELS[item.minTier]}</span>,
        },
        {
            key: 'stock',
            title: 'Остаток',
            render: (item) => (
                <span>{item.stock !== null ? item.stock : <span className="text-gray-400">&#8734;</span>}</span>
            ),
        },
        {
            key: 'isActive',
            title: 'Статус',
            render: (item) => (
                <AdminBadge variant={item.isActive ? 'success' : 'default'}>
                    {item.isActive ? 'Активна' : 'Неактивна'}
                </AdminBadge>
            ),
        },
        {
            key: 'actions',
            title: '',
            width: '100px',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/loyalty/rewards/${item.id}/edit`);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Награды"
                subtitle={`Всего: ${rewards.length}`}
                actions={
                    <div className="flex gap-2">
                        <AdminButton
                            variant="ghost"
                            icon={<ArrowLeft size={18} />}
                            onClick={() => navigate('/admin/loyalty')}
                        >
                            Назад
                        </AdminButton>
                        <AdminButton icon={<Plus size={18} />} onClick={() => navigate('/admin/loyalty/rewards/new')}>
                            Создать
                        </AdminButton>
                    </div>
                }
            />

            <AdminTable
                columns={columns}
                data={rewards}
                getRowId={(item) => item.id}
                onRowClick={(item) => navigate(`/admin/loyalty/rewards/${item.id}/edit`)}
                loading={isLoading}
            />
        </div>
    );
}
