import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Mail, Eye, Download, Gift } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminBadge,
} from '../components';
import type { Column, FilterConfig } from '../components';
import type { Customer, CustomerStatus } from './types';
import { mockCustomers } from './mockData';

const statusLabels: Record<CustomerStatus, string> = {
    active: 'Активен',
    inactive: 'Неактивен',
    deleted: 'Удален',
};

const statusVariants: Record<CustomerStatus, 'success' | 'warning' | 'error'> = {
    active: 'success',
    inactive: 'warning',
    deleted: 'error',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'registrationDate',
        label: 'По дате регистрации',
        type: 'date-range',
    },
    {
        key: 'ordersCount',
        label: 'По количеству заказов',
        type: 'number-range',
    },
    {
        key: 'purchaseAmount',
        label: 'По сумме покупок',
        type: 'number-range',
    },
    {
        key: 'subscription',
        label: 'По наличию подписки',
        type: 'select',
        options: [
            { value: 'active', label: 'Активна' },
            { value: 'inactive', label: 'Не активна' },
        ],
    },
    {
        key: 'status',
        label: 'По статусу аккаунта',
        type: 'select',
        options: [
            { value: 'active', label: 'Активен' },
            { value: 'deleted', label: 'Удалён' },
        ],
    },
];

export function CustomersListPage() {
    const navigate = useNavigate();
    const [customers] = useState<Customer[]>(mockCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

    const columns: Column<Customer>[] = [
        {
            key: 'customerId',
            title: '№ Клиента',
            sortable: true,
            render: (customer) => (
                <span className="font-medium text-blue-600">ID: {customer.customerId}</span>
            ),
        },
        {
            key: 'name',
            title: 'Имя и фамилия',
            sortable: true,
            render: (customer) => `${customer.firstName} ${customer.lastName}`,
        },
        {
            key: 'contacts',
            title: 'Контакты',
            render: (customer) => (
                <div className="text-sm">
                    <div>{customer.email}</div>
                    <div className="text-gray-500">{customer.phone}</div>
                </div>
            ),
        },
        {
            key: 'registrationDate',
            title: 'Дата регистрации',
            sortable: true,
        },
        {
            key: 'ordersCount',
            title: 'Кол-во заказов',
            sortable: true,
            render: (customer) => `${customer.ordersCount} заказов`,
        },
        {
            key: 'totalPurchaseAmount',
            title: 'Общая сумма покупок',
            sortable: true,
            render: (customer) => (
                <span className="font-medium">
                    {customer.totalPurchaseAmount.toLocaleString()} ₽
                </span>
            ),
        },
        {
            key: 'bonusPoints',
            title: 'Бонусные баллы',
            sortable: true,
            render: (customer) => `${customer.bonusPoints} баллов`,
        },
        {
            key: 'status',
            title: 'Статус',
            render: (customer) => (
                <AdminBadge variant={statusVariants[customer.status]}>
                    {statusLabels[customer.status]}
                </AdminBadge>
            ),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '120px',
            render: (customer) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/customers/${customer.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Send email
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Отправить email"
                    >
                        <Mail size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/customers/${customer.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Просмотреть"
                    >
                        <Eye size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const filteredCustomers = customers.filter((customer) => {
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            if (
                !customer.firstName.toLowerCase().includes(search) &&
                !customer.lastName.toLowerCase().includes(search) &&
                !customer.email.toLowerCase().includes(search) &&
                !customer.phone.includes(search)
            ) {
                return false;
            }
        }
        return true;
    });

    return (
        <div>
            <AdminHeader
                title="Управление клиентами"
                subtitle="Таблица клиентов"
                actions={
                    <AdminButton
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/admin/customers/new')}
                    >
                        Добавить клиента
                    </AdminButton>
                }
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AdminInput
                        placeholder="Имя, email, телефон"
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
                    <AdminButton variant="outline">
                        Редактировать
                    </AdminButton>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <AdminButton
                            variant="outline"
                            size="sm"
                            icon={<Gift size={16} />}
                        >
                            Начислить бонусы
                        </AdminButton>
                    )}
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                    >
                        Экспорт данных
                    </AdminButton>
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<Mail size={16} />}
                    >
                        Отправить email
                    </AdminButton>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={filteredCustomers}
                getRowId={(customer) => customer.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(customer) => navigate(`/admin/customers/${customer.id}`)}
            />
        </div>
    );
}
