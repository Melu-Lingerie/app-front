import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, Download, UserX, RefreshCw } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminBadge,
} from '../components';
import type { Column, FilterConfig } from '../components';
import { AdminUserService } from '@/api/services/AdminUserService';
import type { AdminUserResponseDto, UserStatus, UserRole } from '@/api/services/AdminUserService';

const statusLabels: Record<UserStatus, string> = {
    ACTIVE: 'Активен',
    BLOCKED: 'Заблокирован',
    DELETED: 'Удален',
};

const statusVariants: Record<UserStatus, 'success' | 'warning' | 'error'> = {
    ACTIVE: 'success',
    BLOCKED: 'warning',
    DELETED: 'error',
};

const roleLabels: Record<UserRole, string> = {
    USER: 'Пользователь',
    ADMIN: 'Администратор',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'status',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'ACTIVE', label: 'Активен' },
            { value: 'BLOCKED', label: 'Заблокирован' },
            { value: 'DELETED', label: 'Удалён' },
        ],
    },
    {
        key: 'role',
        label: 'По роли',
        type: 'select',
        options: [
            { value: 'USER', label: 'Пользователь' },
            { value: 'ADMIN', label: 'Администратор' },
        ],
    },
];

export function CustomersListPage() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<AdminUserResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const statusFilter = filterValues.status as UserStatus | undefined;
            const roleFilter = filterValues.role as UserRole | undefined;

            const response = await AdminUserService.searchUsers({
                email: searchQuery || undefined,
                status: statusFilter,
                role: roleFilter,
                page: currentPage - 1,
                size: itemsPerPage,
            });
            setCustomers(response.content);
            setTotalItems(response.totalElements);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
            setError('Не удалось загрузить клиентов');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, filterValues.status, filterValues.role, searchQuery]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleBlockUser = async (userId: number, currentStatus: UserStatus) => {
        const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
        const action = newStatus === 'BLOCKED' ? 'заблокировать' : 'разблокировать';

        if (!confirm(`Вы уверены, что хотите ${action} пользователя?`)) return;

        try {
            await AdminUserService.updateStatus(userId, { status: newStatus });
            fetchCustomers();
        } catch (err) {
            console.error('Failed to update user status:', err);
            alert('Не удалось обновить статус пользователя');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const columns: Column<AdminUserResponseDto>[] = [
        {
            key: 'id',
            title: '№ Клиента',
            sortable: true,
            render: (customer) => (
                <span className="font-medium text-blue-600 dark:text-blue-400">ID: {customer.id}</span>
            ),
        },
        {
            key: 'name',
            title: 'Имя и фамилия',
            sortable: true,
            render: (customer) => (
                <span>
                    {customer.firstName || customer.lastName
                        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                        : '—'}
                </span>
            ),
        },
        {
            key: 'contacts',
            title: 'Контакты',
            render: (customer) => (
                <div className="text-sm">
                    <div className="text-gray-900 dark:text-gray-100">{customer.email}</div>
                    {customer.phoneNumber && (
                        <div className="text-gray-500 dark:text-gray-400">{customer.phoneNumber}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'role',
            title: 'Роль',
            render: (customer) => (
                <AdminBadge variant={customer.role === 'ADMIN' ? 'warning' : 'default'}>
                    {roleLabels[customer.role]}
                </AdminBadge>
            ),
        },
        {
            key: 'createdAt',
            title: 'Дата регистрации',
            sortable: true,
            render: (customer) => formatDate(customer.createdAt),
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
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Просмотреть"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${customer.email}`;
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Отправить email"
                    >
                        <Mail size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBlockUser(customer.id, customer.status);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title={customer.status === 'BLOCKED' ? 'Разблокировать' : 'Заблокировать'}
                    >
                        <UserX size={16} />
                    </button>
                </div>
            ),
        },
    ];

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
                title="Управление клиентами"
                subtitle="Таблица клиентов"
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button
                        onClick={fetchCustomers}
                        className="ml-4 underline hover:no-underline"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <AdminInput
                        placeholder="Email, телефон"
                        showSearchIcon
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <div className="flex items-center gap-2">
                        <AdminFilters
                            filters={filterConfigs}
                            values={filterValues}
                            onChange={(key, value) =>
                                setFilterValues((prev) => ({ ...prev, [key]: value }))
                            }
                            onClear={() => setFilterValues({})}
                        />
                        <AdminButton variant="outline" onClick={fetchCustomers} icon={<RefreshCw size={16} />}>
                            Обновить
                        </AdminButton>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                    >
                        Экспорт данных
                    </AdminButton>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={customers}
                getRowId={(customer) => customer.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(customer) => navigate(`/admin/customers/${customer.id}`)}
                loading={loading}
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
