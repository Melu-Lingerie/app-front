import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, FileText, Bell } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminSelect,
} from '../components';
import type { Column, FilterConfig } from '../components';
import type { OrderStatus, OrderListItem } from './types';
import { orderStatusLabels, paymentMethodLabels, deliveryMethodLabels } from './types';
import { AdminOrderService } from '@/api/services/AdminOrderService';

const filterConfigs: FilterConfig[] = [
    {
        key: 'status',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'NEW', label: 'Новый' },
            { value: 'PAID', label: 'Оплачен' },
            { value: 'SHIPPED', label: 'Отправлен' },
            { value: 'DELIVERED', label: 'Доставлен' },
            { value: 'CANCELLED', label: 'Отменён' },
        ],
    },
    {
        key: 'date',
        label: 'По дате (период)',
        type: 'date-range',
    },
    {
        key: 'deliveryMethod',
        label: 'По способу доставки',
        type: 'select',
        options: [
            { value: 'CDEK_COURIER', label: 'Курьер СДЭК' },
            { value: 'CDEK_POINT', label: 'Пункт СДЭК' },
        ],
    },
    {
        key: 'paymentMethod',
        label: 'По способу оплаты',
        type: 'select',
        options: [
            { value: 'CARD', label: 'Картой банка' },
            { value: 'SBP', label: 'СБП' },
        ],
    },
];

const statusSelectOptions = [
    { value: 'NEW', label: 'Новый' },
    { value: 'PAID', label: 'Оплачен' },
    { value: 'SHIPPED', label: 'Отправлен' },
    { value: 'DELIVERED', label: 'Доставлен' },
    { value: 'CANCELLED', label: 'Отменён' },
];

export function OrdersListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const statusFilter = filterValues.status as OrderStatus | undefined;
            const response = await AdminOrderService.getOrders(
                statusFilter,
                currentPage - 1, // API uses 0-based pagination
                itemsPerPage
            );
            setOrders(response.content as OrderListItem[]);
            setTotalItems(response.totalElements);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Не удалось загрузить заказы');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, filterValues.status]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            await AdminOrderService.updateStatus(orderId, { status: newStatus });
            // Update local state
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Не удалось обновить статус заказа');
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        const reason = prompt('Укажите причину отмены:');
        if (!reason) return;

        try {
            await AdminOrderService.cancelOrder(orderId, { reason });
            fetchOrders();
        } catch (err) {
            console.error('Failed to cancel order:', err);
            alert('Не удалось отменить заказ');
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const columns: Column<OrderListItem>[] = [
        {
            key: 'orderNumber',
            title: '№ заказа',
            sortable: true,
            render: (order) => (
                <span className="font-medium">{order.orderNumber}</span>
            ),
        },
        {
            key: 'createdAt',
            title: 'Дата',
            sortable: true,
            render: (order) => formatDate(order.createdAt),
        },
        {
            key: 'itemsCount',
            title: 'Товаров',
            render: (order) => (
                <span>{order.itemsCount} шт.</span>
            ),
        },
        {
            key: 'totalAmount',
            title: 'Сумма',
            sortable: true,
            render: (order) => (
                <span className="font-medium">{order.totalAmount.toLocaleString()} ₽</span>
            ),
        },
        {
            key: 'status',
            title: 'Статус',
            render: (order) => (
                <AdminSelect
                    options={statusSelectOptions}
                    value={order.status}
                    onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, e.target.value as OrderStatus);
                    }}
                    className="w-36"
                />
            ),
        },
        {
            key: 'payment',
            title: 'Оплата',
            render: (order) => (
                <div className="text-sm">
                    <span className="text-gray-900 dark:text-gray-100">
                        {paymentMethodLabels[order.paymentMethod]}
                    </span>
                </div>
            ),
        },
        {
            key: 'delivery',
            title: 'Доставка',
            render: (order) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {deliveryMethodLabels[order.deliveryMethod]}
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '120px',
            render: (order) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${order.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Вы уверены, что хотите отменить заказ?')) {
                                handleCancelOrder(order.id);
                            }
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Отменить заказ"
                        disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${order.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Просмотреть"
                    >
                        <Eye size={16} />
                    </button>
                </div>
            ),
        },
    ];

    // Filter orders by search query (client-side for now)
    const filteredOrders = orders.filter((order) => {
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            return order.orderNumber.toLowerCase().includes(search);
        }
        return true;
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedIds(new Set());
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return (
        <div>
            <AdminHeader
                title="Управление заказами"
                subtitle="Основная таблица заказов"
                actions={
                    <AdminButton
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/admin/orders/new')}
                    >
                        Создать заказ
                    </AdminButton>
                }
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                    <button
                        onClick={fetchOrders}
                        className="ml-4 underline hover:no-underline"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AdminInput
                        placeholder="№ заказа"
                        showSearchIcon
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-72"
                    />
                    <AdminFilters
                        filters={filterConfigs}
                        values={filterValues}
                        onChange={(key, value) =>
                            setFilterValues((prev) => ({ ...prev, [key]: value }))
                        }
                        onClear={() => setFilterValues({})}
                        exportAction={{
                            label: 'Экспорт в Excel',
                            onClick: () => {
                                console.log('Export to Excel');
                            },
                        }}
                    />
                    <AdminButton variant="outline" onClick={fetchOrders}>
                        Обновить
                    </AdminButton>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => {}}
                            >
                                Изменить статус ({selectedIds.size})
                            </AdminButton>
                        </>
                    )}
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<FileText size={16} />}
                    >
                        Экспорт в PDF
                    </AdminButton>
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<Bell size={16} />}
                    >
                        Уведомление
                    </AdminButton>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={filteredOrders}
                getRowId={(order) => order.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
                loading={loading}
                emptyMessage="Заказы не найдены"
                pagination={{
                    currentPage,
                    totalPages,
                    totalItems,
                    itemsPerPage,
                    onPageChange: handlePageChange,
                    onItemsPerPageChange: handleItemsPerPageChange,
                }}
            />
        </div>
    );
}
