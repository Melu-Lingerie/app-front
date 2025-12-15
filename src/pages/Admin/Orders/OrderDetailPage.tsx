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
                <p className="text-gray-500">Заказ не найден</p>
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
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Основное</h2>
                    <div className="grid grid-cols-4 gap-6">
                        {/* Информация о заказе */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Информация о заказе
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Номер заказа</div>
                                    <div className="font-medium">{order.orderNumber}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Дата заказа</div>
                                    <div className="font-medium">{order.createdAt}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Общая сумма</div>
                                    <div className="font-medium">
                                        {order.totalAmount.toLocaleString()} ₽
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Данные клиента */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Данные клиента
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Имя</div>
                                    <div className="font-medium">{order.customerName}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Телефон</div>
                                    <div className="font-medium">{order.customerPhone}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">E-mail</div>
                                    <div className="font-medium">{order.customerEmail}</div>
                                </div>
                            </div>
                        </div>

                        {/* Доставка */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Доставка
                            </h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Способ доставки</div>
                                    <div className="font-medium">
                                        {deliveryMethodLabels[order.deliveryMethod]}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">Адрес</div>
                                    <div className="font-medium text-sm">
                                        {order.deliveryAddress}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Оплата */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Оплата</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500">
                                        Статус (Оплачен/Не оплачен)
                                    </div>
                                    <div className="font-medium">
                                        {paymentStatusLabels[order.paymentStatus]}
                                    </div>
                                </div>
                                {order.paymentTransactionId && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">
                                            ID транзакции
                                        </div>
                                        <div className="font-medium">
                                            {order.paymentTransactionId}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Состав заказа */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-4">Состав заказа</h2>
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
                                    {order.items.length > 0 ? (
                                        order.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-100"
                                            >
                                                <td className="py-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                Нет
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-sm">
                                                    {item.productName}
                                                </td>
                                                <td className="py-3 text-sm text-gray-500">
                                                    ID: {item.articleNumber}
                                                </td>
                                                <td className="py-3 text-sm">
                                                    {item.price.toLocaleString()} ₽
                                                </td>
                                                <td className="py-3 text-sm">
                                                    {item.quantity} шт.
                                                </td>
                                                <td className="py-3 text-sm font-medium">
                                                    {item.totalPrice.toLocaleString()} ₽
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
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-gray-500"
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
                            <h3 className="text-lg font-semibold mb-4">Итоги</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Стоимость товаров</span>
                                    <span>{order.itemsTotal.toLocaleString()} ₽</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Стоимость доставки</span>
                                    <span>{order.deliveryCost.toLocaleString()} ₽</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                                    <span>Общая сумма</span>
                                    <span>{order.totalAmount.toLocaleString()}₽</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
