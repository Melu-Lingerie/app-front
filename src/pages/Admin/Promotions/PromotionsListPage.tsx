import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Pause, Play } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminBadge,
} from '../components';
import type { Column, FilterConfig } from '../components';
import type { PromoCode, PromoCodeStatus, DiscountType } from './types';
import { getPromoCodeStatus } from './types';
import { AdminPromoCodeService } from '../../../api/services/AdminPromoCodeService';

const statusLabels: Record<PromoCodeStatus, string> = {
    active: 'Активен',
    scheduled: 'Запланирован',
    expired: 'Истёк',
    inactive: 'Неактивен',
};

const statusVariants: Record<PromoCodeStatus, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    scheduled: 'default',
    expired: 'warning',
    inactive: 'error',
};

const discountTypeLabels: Record<DiscountType, string> = {
    PERCENTAGE: 'Процент',
    FIXED: 'Фиксированная сумма',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'discountType',
        label: 'По типу',
        type: 'select',
        options: [
            { value: 'PERCENTAGE', label: 'Процент' },
            { value: 'FIXED', label: 'Фиксированная сумма' },
        ],
    },
    {
        key: 'isActive',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'true', label: 'Активные' },
            { value: 'false', label: 'Неактивные' },
        ],
    },
];

export function PromotionsListPage() {
    const navigate = useNavigate();
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });

    const fetchPromoCodes = useCallback(async () => {
        setIsLoading(true);
        try {
            const isActiveFilter = filterValues.isActive as string | undefined;
            const response = await AdminPromoCodeService.searchPromoCodes({
                search: searchQuery || undefined,
                isActive: isActiveFilter ? isActiveFilter === 'true' : undefined,
                page: pagination.page,
                size: pagination.size,
            });
            setPromoCodes(response.content);
            setPagination(prev => ({
                ...prev,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
            }));
        } catch (error) {
            console.error('Failed to fetch promo codes:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, filterValues, pagination.page, pagination.size]);

    useEffect(() => {
        fetchPromoCodes();
    }, [fetchPromoCodes]);

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить промокод?')) return;

        try {
            await AdminPromoCodeService.deletePromoCode(id);
            fetchPromoCodes();
        } catch (error) {
            console.error('Failed to delete promo code:', error);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await AdminPromoCodeService.toggleActive(id);
            fetchPromoCodes();
        } catch (error) {
            console.error('Failed to toggle promo code status:', error);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    };

    const columns: Column<PromoCode>[] = [
        {
            key: 'code',
            title: 'Код',
            sortable: true,
            render: (promo) => (
                <span className="font-mono font-medium">{promo.code}</span>
            ),
        },
        {
            key: 'description',
            title: 'Описание',
            render: (promo) => promo.description || '—',
        },
        {
            key: 'discountType',
            title: 'Тип',
            render: (promo) => discountTypeLabels[promo.discountType],
        },
        {
            key: 'discountValue',
            title: 'Размер скидки',
            render: (promo) =>
                promo.discountType === 'PERCENTAGE'
                    ? `${promo.discountValue}%`
                    : `${promo.discountValue} ₽`,
        },
        {
            key: 'period',
            title: 'Период',
            render: (promo) => `${formatDate(promo.validFrom)} — ${formatDate(promo.validTo)}`,
        },
        {
            key: 'status',
            title: 'Статус',
            render: (promo) => {
                const status = getPromoCodeStatus(promo);
                return (
                    <AdminBadge variant={statusVariants[status]}>
                        {statusLabels[status]}
                    </AdminBadge>
                );
            },
        },
        {
            key: 'usedCount',
            title: 'Использовано',
            render: (promo) => (
                <span>
                    {promo.usedCount}
                    {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                </span>
            ),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '120px',
            render: (promo) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/promotions/${promo.id}/edit`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(promo.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(promo.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={promo.isActive ? 'Деактивировать' : 'Активировать'}
                    >
                        {promo.isActive ? (
                            <Pause size={16} />
                        ) : (
                            <Play size={16} />
                        )}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Управление промокодами"
                subtitle="Основная таблица промокодов"
                actions={
                    <AdminButton
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/admin/promotions/new')}
                    >
                        Создать промокод
                    </AdminButton>
                }
            />

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <AdminInput
                        placeholder="Поиск по коду"
                        showSearchIcon
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <AdminFilters
                        filters={filterConfigs}
                        values={filterValues}
                        onChange={(key, value) =>
                            setFilterValues((prev) => ({ ...prev, [key]: value }))
                        }
                        onClear={() => setFilterValues({})}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                icon={<Pause size={16} />}
                            >
                                Деактивировать
                            </AdminButton>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                icon={<Play size={16} />}
                            >
                                Активировать
                            </AdminButton>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={promoCodes}
                getRowId={(promo) => promo.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(promo) => navigate(`/admin/promotions/${promo.id}/edit`)}
                loading={isLoading}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                    <span className="text-sm text-gray-500">
                        Показано {promoCodes.length} из {pagination.totalElements}
                    </span>
                    <div className="flex gap-2">
                        <AdminButton
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Назад
                        </AdminButton>
                        <AdminButton
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages - 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Вперёд
                        </AdminButton>
                    </div>
                </div>
            )}
        </div>
    );
}
