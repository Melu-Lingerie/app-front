import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
} from '../components';
import { mockOrders } from './mockData';
import type { PaymentStatus } from './types';

const deliveryMethodLabels = {
    courier: 'Курьер',
    cdek_point: 'Пункт СДЭК',
    pickup_point: 'Пункты выдачи',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
    paid: 'Оплачен',
    unpaid: 'Не оплачен',
    refunded: 'Возврат',
};

export function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const order = mockOrders.find((o) => o.id === Number(id));

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Заказ не найден</p>
                <AdminButton
                    variant="outline"
                    onClick={() => navigate('/admin/orders')}
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
                title="Управление заказами"
                subtitle="Детальная карточка заказа"
                actions={
                    <div className="flex items-center gap-3">
                        <AdminButton
                            variant="ghost"
                            icon={<ArrowLeft size={18} />}
                            onClick={() => navigate('/admin/orders')}
                        >
                            Назад
                        </AdminButton>
                        <AdminButton variant="outline">
                            Удалить заказ
                        </AdminButton>
                    </div>
                }
            />

            <div className="space-y-6">
                {/* Основное */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Основное</h2>
                    <div className="grid grid-cols-4 gap-6">
                        {/* Информация о заказе */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Информация о заказе
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Номер заказа</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.orderNumber}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Дата заказа</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.createdAt}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Общая сумма</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {order.totalAmount.toLocaleString()} ₽
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Данные клиента */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Данные клиента
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Имя</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.customerName}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Телефон</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.customerPhone}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">E-mail</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.customerEmail}</div>
                                </div>
                            </div>
                        </div>

                        {/* Доставка */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Доставка
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Способ доставки</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {deliveryMethodLabels[order.deliveryMethod]}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Адрес</div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        {order.deliveryAddress}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Оплата */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Оплата</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Статус (Оплачен/Не оплачен)
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {paymentStatusLabels[order.paymentStatus]}
                                    </div>
                                </div>
                                {order.paymentTransactionId && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID транзакции
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {order.paymentTransactionId}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Состав заказа */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Состав заказа</h2>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Фото
                                        </th>
                                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Товар
                                        </th>
                                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Артикул
                                        </th>
                                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Цена
                                        </th>
                                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Кол-во
                                        </th>
                                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Сумма
                                        </th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.length > 0 ? (
                                        order.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-100 dark:border-gray-700"
                                            >
                                                <td className="py-3">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                                                                Нет
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    {item.productName}
                                                </td>
                                                <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                                                    ID: {item.articleNumber}
                                                </td>
                                                <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    {item.price.toLocaleString()} ₽
                                                </td>
                                                <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    {item.quantity} шт.
                                                </td>
                                                <td className="py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {item.totalPrice.toLocaleString()} ₽
                                                </td>
                                                <td className="py-3">
                                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                                        <Trash2 size={14} className="text-gray-400 dark:text-gray-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                Нет товаров в заказе
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Итоги */}
                        <div className="w-64 ml-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Итоги</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Стоимость товаров</span>
                                    <span className="text-gray-900 dark:text-gray-100">{order.itemsTotal.toLocaleString()} ₽</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Стоимость доставки</span>
                                    <span className="text-gray-900 dark:text-gray-100">{order.deliveryCost.toLocaleString()} ₽</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-900 dark:text-gray-100">Общая сумма</span>
                                    <span className="text-gray-900 dark:text-gray-100">{order.totalAmount.toLocaleString()}₽</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
