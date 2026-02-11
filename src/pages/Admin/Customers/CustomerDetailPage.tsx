import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminBadge,
} from '../components';
import { AdminUserService } from '@/api/services/AdminUserService';
import type { AdminUserResponseDto, UserStatus } from '@/api/services/AdminUserService';

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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<AdminUserResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(null);
        AdminUserService.getUser(Number(id))
            .then((data) => {
                setCustomer(data);
            })
            .catch((err) => {
                console.error('Failed to load customer:', err);
                setError('Не удалось загрузить данные клиента');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Загрузка...</div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{error || 'Клиент не найден'}</p>
                <AdminButton
                    variant="outline"
                    onClick={() => navigate('/admin/customers')}
                    className="mt-4"
                >
                    Вернуться к списку
                </AdminButton>
            </div>
        );
    }

    return (
        <div>
            <AdminHeader
                title="Управление клиентами"
                subtitle="Карточка клиента"
                actions={
                    <div className="flex items-center gap-3">
                        <AdminButton
                            variant="ghost"
                            icon={<ArrowLeft size={18} />}
                            onClick={() => navigate('/admin/customers')}
                        >
                            Назад
                        </AdminButton>
                    </div>
                }
            />

            <div className="space-y-6">
                {/* Основное */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Основное</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Основная информация */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Основная информация
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {customer.id}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Имя, фамилия</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {customer.firstName || customer.lastName
                                            ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                                            : 'Не указано'}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Роль</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        <AdminBadge variant={customer.role === 'ADMIN' ? 'warning' : 'default'}>
                                            {customer.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                                        </AdminBadge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Контакты */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Контакты
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{customer.email}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Телефон</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {customer.phoneNumber || 'Не указан'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Статус и даты */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Статус и даты
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Статус</div>
                                    <div className="font-medium">
                                        <AdminBadge variant={statusVariants[customer.status]}>
                                            {statusLabels[customer.status]}
                                        </AdminBadge>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Дата регистрации</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate(customer.createdAt)}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Последнее обновление</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate(customer.updatedAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
