import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminHeader, AdminBadge, AdminPagination } from '../components';
import {
    AdminReturnService,
    RETURN_STATUS_LABELS,
    RETURN_REASON_LABELS,
    type ReturnListItemDto,
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

export function ReturnsListPage() {
    const navigate = useNavigate();
    const [returns, setReturns] = useState<ReturnListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const result = await AdminReturnService.searchReturns(
                statusFilter || undefined,
                currentPage - 1,
                20,
            );
            setReturns(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (err) {
            console.error('Failed to load returns:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter]);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    const numberFormat = (n?: number) => n != null ? n.toLocaleString('ru-RU') : '—';

    return (
        <div>
            <AdminHeader title="Возвраты" />

            <div className="mb-6 flex gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as ReturnStatus | ''); setCurrentPage(1); }}
                    className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                    <option value="">Все статусы</option>
                    {Object.entries(RETURN_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : returns.length === 0 ? (
                <div className="text-center text-gray-400 py-20">Возвратов не найдено</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 uppercase text-xs">
                                    <th className="pb-3 pr-4">Номер</th>
                                    <th className="pb-3 pr-4">Заказ</th>
                                    <th className="pb-3 pr-4">Клиент</th>
                                    <th className="pb-3 pr-4">Статус</th>
                                    <th className="pb-3 pr-4">Причина</th>
                                    <th className="pb-3 pr-4">Сумма</th>
                                    <th className="pb-3">Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.map((ret) => (
                                    <tr
                                        key={ret.id}
                                        onClick={() => navigate(`/admin/returns/${ret.id}`)}
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                    >
                                        <td className="py-3 pr-4 font-medium">{ret.returnNumber}</td>
                                        <td className="py-3 pr-4 text-gray-500">{ret.orderNumber}</td>
                                        <td className="py-3 pr-4">{ret.customerName || '—'}</td>
                                        <td className="py-3 pr-4">
                                            <AdminBadge variant={STATUS_VARIANTS[ret.status]}>
                                                {RETURN_STATUS_LABELS[ret.status]}
                                            </AdminBadge>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-500">{RETURN_REASON_LABELS[ret.reason]}</td>
                                        <td className="py-3 pr-4">{numberFormat(ret.refundAmount)} ₽</td>
                                        <td className="py-3">{formatDate(ret.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <AdminPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalElements}
                                itemsPerPage={20}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
