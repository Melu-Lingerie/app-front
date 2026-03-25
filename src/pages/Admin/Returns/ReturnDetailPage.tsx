import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AdminHeader, AdminButton, AdminBadge, AdminTextarea } from '../components';
import {
    AdminReturnService,
    RETURN_STATUS_LABELS,
    RETURN_REASON_LABELS,
    type ReturnResponseDto,
    type ReturnStatus,
} from '@/api/services/AdminReturnService';

const STATUS_VARIANTS: Record<ReturnStatus, 'warning' | 'info' | 'error' | 'default' | 'success'> = {
    PENDING: 'warning',
    APPROVED: 'info',
    REJECTED: 'error',
    SHIPPED_BACK: 'info',
    RECEIVED: 'success',
    REFUNDED: 'default',
};

export function ReturnDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ret, setRet] = useState<ReturnResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminComment, setAdminComment] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        AdminReturnService.getReturn(Number(id))
            .then((data) => {
                setRet(data);
                setAdminComment(data.adminComment || '');
            })
            .catch((err) => console.error('Failed to load return:', err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAction = async (action: () => Promise<ReturnResponseDto>) => {
        setActionLoading(true);
        try {
            const updated = await action();
            setRet(updated);
            setAdminComment(updated.adminComment || '');
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const numberFormat = (n?: number) => n != null ? n.toLocaleString('ru-RU') : '—';

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!ret) {
        return <div className="text-center text-gray-400 py-20">Возврат не найден</div>;
    }

    return (
        <div>
            <AdminHeader
                title={`Возврат ${ret.returnNumber}`}
                actions={
                    <AdminButton variant="outline" onClick={() => navigate('/admin/returns')}>
                        <ArrowLeft size={16} className="mr-2" /> Назад
                    </AdminButton>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Info + Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Return Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Информация о возврате</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Статус</span>
                                <div className="mt-1">
                                    <AdminBadge variant={STATUS_VARIANTS[ret.status]}>
                                        {RETURN_STATUS_LABELS[ret.status]}
                                    </AdminBadge>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Причина</span>
                                <p className="mt-1 font-medium">{ret.reasonDisplayName || RETURN_REASON_LABELS[ret.reason]}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Заказ</span>
                                <p className="mt-1">
                                    <span
                                        className="text-blue-600 cursor-pointer hover:underline"
                                        onClick={() => navigate(`/admin/orders/${ret.orderId}`)}
                                    >
                                        {ret.orderNumber}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Сумма возврата</span>
                                <p className="mt-1 font-medium">{numberFormat(ret.refundAmount)} ₽</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Создан</span>
                                <p className="mt-1">{formatDate(ret.createdAt)}</p>
                            </div>
                            {ret.cdekTrackingNumber && (
                                <div>
                                    <span className="text-gray-500">Трекинг СДЭК</span>
                                    <p className="mt-1 font-medium">{ret.cdekTrackingNumber}</p>
                                </div>
                            )}
                        </div>
                        {ret.comment && (
                            <div className="mt-4">
                                <span className="text-gray-500 text-sm">Комментарий клиента</span>
                                <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{ret.comment}</p>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Товары к возврату</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 text-xs uppercase">
                                    <th className="pb-2 pr-4">Товар</th>
                                    <th className="pb-2 pr-4">Цвет</th>
                                    <th className="pb-2 pr-4">Размер</th>
                                    <th className="pb-2 pr-4">Кол-во</th>
                                    <th className="pb-2">Цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ret.items.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 pr-4 font-medium">{item.productName || '—'}</td>
                                        <td className="py-3 pr-4 text-gray-500">{item.color || '—'}</td>
                                        <td className="py-3 pr-4 text-gray-500">{item.size || '—'}</td>
                                        <td className="py-3 pr-4">{item.quantity}</td>
                                        <td className="py-3">{numberFormat(item.unitPrice)} ₽</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="space-y-6">
                    {/* Admin Comment */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Комментарий администратора</h3>
                        <AdminTextarea
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            placeholder="Комментарий для клиента..."
                            rows={4}
                        />
                    </div>

                    {/* Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Действия</h3>
                        <div className="space-y-3">
                            {ret.status === 'PENDING' && (
                                <>
                                    <AdminButton
                                        className="w-full"
                                        onClick={() => handleAction(() => AdminReturnService.approveReturn(ret.id))}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                        Одобрить возврат
                                    </AdminButton>
                                    <AdminButton
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleAction(() => AdminReturnService.rejectReturn(ret.id, adminComment))}
                                        disabled={actionLoading}
                                    >
                                        Отклонить
                                    </AdminButton>
                                </>
                            )}
                            {(ret.status === 'APPROVED' || ret.status === 'SHIPPED_BACK') && (
                                <AdminButton
                                    className="w-full"
                                    onClick={() => handleAction(() => AdminReturnService.receiveReturn(ret.id))}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                    Товар получен
                                </AdminButton>
                            )}
                            {ret.status === 'RECEIVED' && (
                                <AdminButton
                                    className="w-full"
                                    onClick={() => handleAction(() => AdminReturnService.refundReturn(ret.id))}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                    Деньги возвращены
                                </AdminButton>
                            )}
                            {ret.status === 'REJECTED' && (
                                <p className="text-sm text-gray-500 text-center">Возврат отклонён</p>
                            )}
                            {ret.status === 'REFUNDED' && (
                                <p className="text-sm text-gray-500 text-center">Возврат завершён</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
