import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminHeader, AdminButton, AdminTable, AdminInput, AdminBadge } from '../components';
import type { Column } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { LoyaltyAccountResponse, LoyaltyTier } from '@/api/models/LoyaltyDto';

const TIER_LABELS: Record<LoyaltyTier, string> = {
    FIRST_SPOONFUL: 'First Spoonful',
    SWEET_MOMENT: 'Sweet Moment',
    SECRET_PLEASURE: 'Secret Pleasure',
};

const TIER_VARIANTS: Record<LoyaltyTier, 'default' | 'info' | 'warning'> = {
    FIRST_SPOONFUL: 'default',
    SWEET_MOMENT: 'info',
    SECRET_PLEASURE: 'warning',
};

export function LoyaltyAccountsPage() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<LoyaltyAccountResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
    });

    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AdminLoyaltyService.getAccounts(pagination.page, pagination.size);
            setAccounts(response.content);
            setPagination((prev) => ({
                ...prev,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
            }));
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.size]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const columns: Column<LoyaltyAccountResponse>[] = [
        {
            key: 'id',
            title: 'ID',
            width: '80px',
            render: (item) => <span className="text-gray-500">#{item.id}</span>,
        },
        {
            key: 'userId',
            title: 'User ID',
            width: '100px',
            render: (item) => <span>{item.userId}</span>,
        },
        {
            key: 'tier',
            title: 'Уровень',
            render: (item) => (
                <AdminBadge variant={TIER_VARIANTS[item.tier]}>
                    {TIER_LABELS[item.tier]}
                </AdminBadge>
            ),
        },
        {
            key: 'crumbsBalance',
            title: 'Баланс',
            render: (item) => <span className="font-medium">{item.crumbsBalance.toFixed(1)}</span>,
        },
        {
            key: 'crumbsTotalEarned',
            title: 'Всего заработано',
            render: (item) => <span>{item.crumbsTotalEarned.toFixed(1)}</span>,
        },
        {
            key: 'spendAmount6m',
            title: 'Расходы 6м',
            render: (item) => <span>{Math.round(item.spendAmount6m).toLocaleString()} &#8381;</span>,
        },
        {
            key: 'spendAmount12m',
            title: 'Расходы 12м',
            render: (item) => <span>{Math.round(item.spendAmount12m).toLocaleString()} &#8381;</span>,
        },
        {
            key: 'referralCode',
            title: 'Реферальный код',
            render: (item) => <span className="font-mono text-xs">{item.referralCode}</span>,
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Аккаунты лояльности"
                subtitle={`Всего: ${pagination.totalElements}`}
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/loyalty')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <AdminTable
                columns={columns}
                data={accounts}
                getRowId={(item) => item.id}
                onRowClick={(item) => navigate(`/admin/loyalty/accounts/${item.id}`)}
                loading={isLoading}
                pagination={{
                    currentPage: pagination.page + 1,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.totalElements,
                    itemsPerPage: pagination.size,
                    onPageChange: (page) => setPagination((prev) => ({ ...prev, page: page - 1 })),
                }}
            />
        </div>
    );
}
