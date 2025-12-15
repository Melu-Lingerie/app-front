import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminBadge,
} from '../components';
import { mockCustomers } from './mockData';

export function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const customer = mockCustomers.find((c) => c.id === Number(id));

    if (!customer) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Клиент не найден</p>
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
                        <AdminButton variant="outline">
                            Редактировать
                        </AdminButton>
                        <AdminButton variant="outline">
                            Удалить клиента
                        </AdminButton>
                    </div>
                }
            />

            <div className="space-y-6">
                {/* Основное */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Основное</h2>
                    <div className="grid grid-cols-5 gap-6">
                        {/* Основная информация */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Основная информация
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Имя, фамилия</div>
                                    <div className="font-medium">
                                        {customer.firstName} {customer.lastName}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Дата рождения</div>
                                    <div className="font-medium">
                                        {customer.birthDate || 'Не указана'}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Пол</div>
                                    <div className="font-medium">
                                        {customer.gender === 'female'
                                            ? 'Женский'
                                            : customer.gender === 'male'
                                            ? 'Мужской'
                                            : 'Не указан'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Контакты */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Контакты
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">
                                        Email ({customer.emailVerified ? 'подтвержден' : 'не подтвержден'})
                                    </div>
                                    <div className="font-medium">{customer.email}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Телефон</div>
                                    <div className="font-medium">{customer.phone}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Адрес доставки</div>
                                    <div className="font-medium text-sm">
                                        {customer.deliveryAddress || 'Не указан'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Бонусные баллы */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Бонусные баллы
                            </h3>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500">Текущий баланс</div>
                                <div className="font-semibold text-xl">
                                    {customer.bonusPoints} баллов
                                </div>
                            </div>
                        </div>

                        {/* История начислений/списаний */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                История начислений/списаний
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {customer.bonusTransactions.length > 0 ? (
                                    customer.bonusTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="p-2 bg-gray-50 rounded-lg text-sm"
                                        >
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    {transaction.date}
                                                </span>
                                                <span
                                                    className={
                                                        transaction.type === 'accrual'
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {transaction.type === 'accrual' ? '+' : ''}
                                                    {transaction.amount}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {transaction.reason}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">Нет операций</div>
                                )}
                            </div>
                        </div>

                        {/* Активность */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Активность
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">
                                        Подписки (рассылки)
                                    </div>
                                    <AdminBadge
                                        variant={
                                            customer.hasNewsletterSubscription
                                                ? 'success'
                                                : 'default'
                                        }
                                    >
                                        {customer.hasNewsletterSubscription
                                            ? 'Подписан'
                                            : 'Не подписан'}
                                    </AdminBadge>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">
                                        Подписки (Secret Box)
                                    </div>
                                    <AdminBadge
                                        variant={
                                            customer.hasSecretBoxSubscription
                                                ? 'success'
                                                : 'default'
                                        }
                                    >
                                        {customer.hasSecretBoxSubscription
                                            ? 'Подписан'
                                            : 'Не подписан'}
                                    </AdminBadge>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* История заказов */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">История заказов</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-sm font-medium text-gray-600">
                                    Фото
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-600">
                                    Товар
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-600">
                                    Артикул
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-600">
                                    Цена
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-600">
                                    Кол-во
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-600">
                                    Сумма
                                </th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {customer.orders.length > 0 ? (
                                customer.orders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100">
                                        <td className="py-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded"></div>
                                        </td>
                                        <td className="py-3 text-sm">
                                            Заказ #{order.orderNumber}
                                        </td>
                                        <td className="py-3 text-sm text-gray-500">
                                            {order.date}
                                        </td>
                                        <td className="py-3 text-sm">
                                            {order.amount.toLocaleString()} ₽
                                        </td>
                                        <td className="py-3 text-sm">-</td>
                                        <td className="py-3 text-sm font-medium">
                                            {order.amount.toLocaleString()} ₽
                                        </td>
                                        <td className="py-3">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Trash2 size={14} className="text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
                                        Нет заказов
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Итоги */}
                    <div className="mt-6 flex justify-end">
                        <div className="w-64 space-y-2">
                            <h3 className="text-lg font-semibold">Итоги</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Стоимость товаров</span>
                                <span>990 ₽</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Стоимость доставки</span>
                                <span>0 ₽</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                                <span>Общая сумма</span>
                                <span>
                                    {customer.totalPurchaseAmount.toLocaleString()}₽
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
