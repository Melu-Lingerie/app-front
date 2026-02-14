import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { AdminHeader, AdminButton, AdminTable, AdminBadge } from '../components';
import type { Column } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { RewardRedemptionResponse, RedemptionStatus } from '@/api/models/LoyaltyDto';

const STATUS_LABELS: Record<RedemptionStatus, string> = {
    PENDING: 'Ожидает',
    FULFILLED: 'Выполнен',
    CANCELLED: 'Отменён',
};

const STATUS_VARIANTS: Record<RedemptionStatus, 'warning' | 'success' | 'error'> = {
    PENDING: 'warning',
    FULFILLED: 'success',
    CANCELLED: 'error',
};

export function LoyaltyRedemptionsPage() {
    const navigate = useNavigate();
    const [redemptions, setRedemptions] = useState<RewardRedemptionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
    });

    const fetchRedemptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AdminLoyaltyService.getRedemptions(pagination.page, pagination.size);
            setRedemptions(response.content);
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
        fetchRedemptions();
    }, [fetchRedemptions]);

    const handleFulfill = async (id: number) => {
        await AdminLoyaltyService.fulfillRedemption(id);
        fetchRedemptions();
    };

    const columns: Column<RewardRedemptionResponse>[] = [
        {
            key: 'id',
            title: 'ID',
            width: '60px',
            render: (item) => <span className="text-gray-500">#{item.id}</span>,
        },
        {
            key: 'rewardName',
            title: 'Награда',
            render: (item) => <span className="font-medium dark:text-white">{item.rewardName}</span>,
        },
        {
            key: 'crumbsSpent',
            title: 'Крошек',
            render: (item) => <span>{item.crumbsSpent}</span>,
        },
        {
            key: 'loyaltyAccountId',
            title: 'Аккаунт',
            render: (item) => <span>#{item.loyaltyAccountId}</span>,
        },
        {
            key: 'status',
            title: 'Статус',
            render: (item) => (
                <AdminBadge variant={STATUS_VARIANTS[item.status]}>
                    {STATUS_LABELS[item.status]}
                </AdminBadge>
            ),
        },
        {
            key: 'createdAt',
            title: 'Дата',
            render: (item) => <span>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>,
        },
        {
            key: 'actions',
            title: '',
            width: '80px',
            render: (item) =>
                item.status === 'PENDING' ? (
                    <AdminButton
                        variant="outline"
                        size="sm"
                        icon={<Check size={14} />}
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleFulfill(item.id);
                        }}
                    >
                        Выполнено
                    </AdminButton>
                ) : null,
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Обмены наград"
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
                data={redemptions}
                getRowId={(item) => item.id}
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
