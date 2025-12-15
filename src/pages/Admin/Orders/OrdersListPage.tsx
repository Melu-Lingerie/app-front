import { useState, useMemo } from 'react';
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
import type { Order, OrderStatus, PaymentStatus } from './types';
import { mockOrders } from './mockData';

const paymentStatusLabels: Record<PaymentStatus, string> = {
    paid: 'Оплачен',
    unpaid: 'Не оплачен',
    refunded: 'Возврат',
};

const paymentMethodLabels = {
    card: 'Карта',
    sbp: 'СБП',
    cash_on_delivery: 'При получении',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'status',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'new', label: 'Новый' },
            { value: 'confirmed', label: 'Подтвержден' },
            { value: 'processing', label: 'В обработке' },
            { value: 'delivered', label: 'Доставлен' },
            { value: 'cancelled', label: 'Отменен' },
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
            { value: 'courier', label: 'Курьер' },
            { value: 'cdek_point', label: 'Пункт СДЭК' },
            { value: 'pickup_point', label: 'Пункты выдачи' },
        ],
    },
    {
        key: 'paymentMethod',
        label: 'По способу оплаты',
        type: 'select',
        options: [
            { value: 'card', label: 'Картой банка' },
            { value: 'sbp', label: 'СБП' },
            { value: 'cash_on_delivery', label: 'После получения' },
        ],
    },
    {
        key: 'amount',
        label: 'По сумме (диапазон)',
        type: 'number-range',
    },
];

const statusSelectOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'confirmed', label: 'Подтвержден' },
    { value: 'processing', label: 'В обработке' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменен' },
];

export function OrdersListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const columns: Column<Order>[] = [
        {
            key: 'orderNumber',
            title: '№ заказа',
            sortable: true,
            render: (order) => (
                <span className="font-medium">ID: {order.orderNumber}</span>
            ),
        },
        {
            key: 'createdAt',
            title: 'Дата',
            sortable: true,
            render: (order) => order.createdAt,
        },
        {
            key: 'customer',
            title: 'Клиент',
            render: (order) => (
                <div>
                    <div className="text-gray-900 dark:text-gray-100">{order.customerName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.customerEmail}</div>
                </div>
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
                    <span className="text-gray-900 dark:text-gray-100">{paymentMethodLabels[order.paymentMethod]}</span>
                    <span className="text-gray-400 dark:text-gray-500"> + </span>
                    <span className={
                        order.paymentStatus === 'paid'
                            ? 'text-green-600 dark:text-green-400'
                            : order.paymentStatus === 'refunded'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 dark:text-gray-400'
                    }>
                        {paymentStatusLabels[order.paymentStatus]}
                    </span>
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
                            // TODO: Delete order
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Удалить"
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

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (searchQuery) {
                const search = searchQuery.toLowerCase();
                if (
                    !order.orderNumber.toLowerCase().includes(search) &&
                    !order.customerEmail.toLowerCase().includes(search) &&
                    !order.customerPhone.includes(search)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [orders, searchQuery]);

    // Пагинация
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

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

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AdminInput
                        placeholder="№ заказа, email или телефон клиента"
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
                                // TODO: Implement Excel export
                            },
                        }}
                    />
                    <AdminButton variant="outline">
                        Редактировать заказ
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
                                Изменить статус
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
                        Отправить уведомление
                    </AdminButton>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={paginatedOrders}
                getRowId={(order) => order.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
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
