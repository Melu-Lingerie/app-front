import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Package, AlertTriangle, CheckCircle, Clock, Upload, ArrowDownToLine } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminBadge,
    AdminInput,
    AdminModal,
} from '../components';
import type { Column } from '../components';
import { AdminMoySkladService } from '@/api/services/AdminMoySkladService';
import type { MoySkladProductMapping } from '@/api/services/AdminMoySkladService';

type SyncStatus = 'SYNCED' | 'PENDING' | 'ERROR';

const statusVariant: Record<SyncStatus, 'success' | 'warning' | 'error'> = {
    SYNCED: 'success',
    PENDING: 'warning',
    ERROR: 'error',
};

const statusLabel: Record<SyncStatus, string> = {
    SYNCED: 'Синхронизирован',
    PENDING: 'Ожидание',
    ERROR: 'Ошибка',
};

const PAGE_SIZE = 20;

export function MoySkladPage() {
    const [mappings, setMappings] = useState<MoySkladProductMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [syncingStock, setSyncingStock] = useState(false);
    const [syncingProducts, setSyncingProducts] = useState(false);
    const [syncingOrder, setSyncingOrder] = useState(false);

    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [orderIdInput, setOrderIdInput] = useState('');
    const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const fetchMappings = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminMoySkladService.getMappings(page, PAGE_SIZE);
            setMappings(data.content);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalElements);
            setCurrentPage(data.number);
        } catch (err) {
            console.error('Error fetching mappings:', err);
            setError('Не удалось загрузить маппинги');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMappings();
    }, [fetchMappings]);

    const handlePageChange = (page: number) => {
        fetchMappings(page - 1); // AdminTable uses 1-based pages
    };

    const showMessage = (text: string, type: 'success' | 'error') => {
        setSyncMessage({ text, type });
        setTimeout(() => setSyncMessage(null), 5000);
    };

    const handleSyncStock = async () => {
        try {
            setSyncingStock(true);
            await AdminMoySkladService.syncStock();
            showMessage('Остатки успешно синхронизированы', 'success');
        } catch (err) {
            console.error('Stock sync error:', err);
            showMessage('Ошибка синхронизации остатков', 'error');
        } finally {
            setSyncingStock(false);
        }
    };

    const handleSyncProducts = async () => {
        try {
            setSyncingProducts(true);
            await AdminMoySkladService.syncProducts();
            showMessage('Товары успешно синхронизированы', 'success');
            await fetchMappings(currentPage);
        } catch (err) {
            console.error('Products sync error:', err);
            showMessage('Ошибка синхронизации товаров', 'error');
        } finally {
            setSyncingProducts(false);
        }
    };

    const handleSyncOrder = async () => {
        const orderId = Number(orderIdInput);
        if (!orderId || isNaN(orderId)) return;

        try {
            setSyncingOrder(true);
            await AdminMoySkladService.syncOrder(orderId);
            showMessage(`Заказ #${orderId} экспортирован в МойСклад`, 'success');
            setOrderModalOpen(false);
            setOrderIdInput('');
        } catch (err) {
            console.error('Order sync error:', err);
            showMessage(`Ошибка экспорта заказа #${orderId}`, 'error');
        } finally {
            setSyncingOrder(false);
        }
    };

    const errorCount = mappings.filter((m) => m.syncStatus === 'ERROR').length;
    const lastSync = mappings.length > 0
        ? mappings.reduce((latest, m) => {
            if (!m.lastSyncAt) return latest;
            return !latest || m.lastSyncAt > latest ? m.lastSyncAt : latest;
        }, '' as string)
        : null;

    const columns: Column<MoySkladProductMapping>[] = [
        {
            key: 'productId',
            title: 'ID товара',
            width: '100px',
            render: (item) => (
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {item.productId}
                </span>
            ),
        },
        {
            key: 'articleNumber',
            title: 'Артикул',
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.articleNumber}
                </span>
            ),
        },
        {
            key: 'moySkladProductId',
            title: 'ID в МойСклад',
            render: (item) => (
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {item.moySkladProductId.substring(0, 8)}...
                </span>
            ),
        },
        {
            key: 'syncStatus',
            title: 'Статус',
            render: (item) => (
                <AdminBadge variant={statusVariant[item.syncStatus]}>
                    {statusLabel[item.syncStatus]}
                </AdminBadge>
            ),
        },
        {
            key: 'lastSyncAt',
            title: 'Последняя синхр.',
            render: (item) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.lastSyncAt
                        ? new Date(item.lastSyncAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        : '—'}
                </span>
            ),
        },
    ];

    return (
        <div>
            <AdminHeader
                title="МойСклад"
                subtitle="Синхронизация товаров, остатков и заказов"
                actions={
                    <AdminButton
                        variant="outline"
                        icon={<RefreshCw size={18} />}
                        onClick={() => fetchMappings(currentPage)}
                    >
                        Обновить
                    </AdminButton>
                }
            />

            {/* Sync message */}
            {syncMessage && (
                <div
                    className={`mb-4 p-4 rounded-lg border ${
                        syncMessage.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    }`}
                >
                    {syncMessage.text}
                </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Всего связано</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ошибки (на стр.)</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{errorCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Последняя синхр.</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {lastSync
                                    ? new Date(lastSync).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                <AdminButton
                    variant="primary"
                    icon={<ArrowDownToLine size={18} />}
                    onClick={handleSyncStock}
                    loading={syncingStock}
                    disabled={syncingStock}
                >
                    Синхронизировать остатки
                </AdminButton>

                <AdminButton
                    variant="secondary"
                    icon={<Upload size={18} />}
                    onClick={handleSyncProducts}
                    loading={syncingProducts}
                    disabled={syncingProducts}
                >
                    Выгрузить товары
                </AdminButton>

                <AdminButton
                    variant="outline"
                    icon={<Package size={18} />}
                    onClick={() => setOrderModalOpen(true)}
                >
                    Экспорт заказа
                </AdminButton>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button onClick={() => fetchMappings(currentPage)} className="ml-4 underline">
                        Повторить
                    </button>
                </div>
            )}

            {/* Product mappings table */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Маппинг товаров ({totalItems})
                </h2>
            </div>

            <AdminTable
                columns={columns}
                data={mappings}
                getRowId={(item) => item.id}
                loading={loading}
                pagination={{
                    currentPage: currentPage + 1,
                    totalPages,
                    totalItems,
                    itemsPerPage: PAGE_SIZE,
                    onPageChange: handlePageChange,
                }}
                renderMobileCard={(item) => (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.articleNumber}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    ID: {item.productId}
                                </span>
                            </div>
                            <AdminBadge variant={statusVariant[item.syncStatus]}>
                                {statusLabel[item.syncStatus]}
                            </AdminBadge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            МС: {item.moySkladProductId.substring(0, 12)}...
                        </div>
                        {item.lastSyncAt && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {new Date(item.lastSyncAt).toLocaleString('ru-RU')}
                            </div>
                        )}
                    </div>
                )}
            />

            {/* Order export modal */}
            <AdminModal
                isOpen={orderModalOpen}
                onClose={() => {
                    setOrderModalOpen(false);
                    setOrderIdInput('');
                }}
                title="Экспорт заказа в МойСклад"
                size="sm"
            >
                <div className="space-y-4">
                    <AdminInput
                        label="ID заказа"
                        placeholder="Введите ID заказа"
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <AdminButton
                            variant="outline"
                            onClick={() => {
                                setOrderModalOpen(false);
                                setOrderIdInput('');
                            }}
                        >
                            Отмена
                        </AdminButton>
                        <AdminButton
                            onClick={handleSyncOrder}
                            loading={syncingOrder}
                            disabled={syncingOrder || !orderIdInput}
                        >
                            Экспортировать
                        </AdminButton>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
