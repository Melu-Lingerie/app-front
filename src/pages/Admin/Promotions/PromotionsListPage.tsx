import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Download, Pause, Play } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminBadge,
    AdminSelect,
} from '../components';
import type { Column, FilterConfig } from '../components';
import type { Promotion, PromotionStatus, DiscountType } from './types';
import { mockPromotions } from './mockData';

const statusLabels: Record<PromotionStatus, string> = {
    active: 'Активна',
    scheduled: 'Запланирована',
    completed: 'Завершена',
    paused: 'Приостановлена',
};

const statusVariants: Record<PromotionStatus, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    scheduled: 'default',
    completed: 'warning',
    paused: 'error',
};

const discountTypeLabels: Record<DiscountType, string> = {
    percent: 'Скидка',
    fixed_amount: 'Фиксированная сумма',
    gift: 'Подарок',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'type',
        label: 'По типу',
        type: 'select',
        options: [
            { value: 'percent', label: 'Скидка' },
            { value: 'fixed_amount', label: 'Фиксированная сумма' },
            { value: 'gift', label: 'Подарок' },
        ],
    },
    {
        key: 'status',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'active', label: 'Активна' },
            { value: 'scheduled', label: 'Запланирована' },
            { value: 'completed', label: 'Завершена' },
            { value: 'paused', label: 'Приостановлена' },
        ],
    },
];

export function PromotionsListPage() {
    const navigate = useNavigate();
    const [promotions] = useState<Promotion[]>(mockPromotions);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [viewMode, setViewMode] = useState<'promotions' | 'promocodes'>('promotions');

    const columns: Column<Promotion>[] = [
        {
            key: 'name',
            title: 'Название акции',
            sortable: true,
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
                promo.discountType === 'percent'
                    ? `${promo.discountValue}%`
                    : promo.discountType === 'fixed_amount'
                    ? `${promo.discountValue} ₽`
                    : '—',
        },
        {
            key: 'period',
            title: 'Период активности',
            render: (promo) => `${promo.startDate} / ${promo.endDate}`,
        },
        {
            key: 'status',
            title: 'Статус',
            render: (promo) => (
                <AdminBadge variant={statusVariants[promo.status]}>
                    {statusLabels[promo.status]}
                </AdminBadge>
            ),
        },
        {
            key: 'usedCount',
            title: 'Использовано',
            render: (promo) => `${promo.usedCount} раз`,
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
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Delete promotion
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Toggle status
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={promo.status === 'active' ? 'Приостановить' : 'Активировать'}
                    >
                        {promo.status === 'active' ? (
                            <Pause size={16} />
                        ) : (
                            <Play size={16} />
                        )}
                    </button>
                </div>
            ),
        },
    ];

    const filteredPromotions = promotions.filter((promo) => {
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            if (!promo.name.toLowerCase().includes(search)) {
                return false;
            }
        }
        return true;
    });

    return (
        <div>
            <AdminHeader
                title="Управление промо-акциями и скидками"
                subtitle="Основная таблица акций"
                actions={
                    <AdminButton
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/admin/promotions/new')}
                    >
                        Создать акцию
                    </AdminButton>
                }
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AdminInput
                        placeholder="Поиск по названию акции"
                        showSearchIcon
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <AdminFilters
                        filters={filterConfigs}
                        values={filterValues}
                        onChange={(key, value) =>
                            setFilterValues((prev) => ({ ...prev, [key]: value }))
                        }
                        onClear={() => setFilterValues({})}
                    />
                    <AdminSelect
                        options={[
                            { value: 'promotions', label: 'Таблица' },
                            { value: 'promocodes', label: 'Промокоды' },
                        ]}
                        value={viewMode}
                        onChange={(e) =>
                            setViewMode(e.target.value as 'promotions' | 'promocodes')
                        }
                        className="w-36"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                icon={<Pause size={16} />}
                            >
                                Приостановить
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
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                    >
                        Экспорт статистики
                    </AdminButton>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={filteredPromotions}
                getRowId={(promo) => promo.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(promo) => navigate(`/admin/promotions/${promo.id}/edit`)}
            />
        </div>
    );
}
