import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Download } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminBadge,
} from '../components';
import type { Column, FilterConfig } from '../components';
import { AdminProductService } from '@/api/services/AdminProductService';
import type { ProductAdminListItemDto, ProductStatus } from '@/api/services/AdminProductService';

const statusLabels: Record<ProductStatus, string> = {
    ACTIVE: 'В продаже',
    DRAFT: 'Черновик',
    ARCHIVED: 'В архиве',
};

const statusVariants: Record<ProductStatus, 'success' | 'warning' | 'error'> = {
    ACTIVE: 'success',
    DRAFT: 'warning',
    ARCHIVED: 'error',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'status',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'ACTIVE', label: 'В продаже' },
            { value: 'DRAFT', label: 'Черновик' },
            { value: 'ARCHIVED', label: 'В архиве' },
        ],
    },
    {
        key: 'price',
        label: 'По цене',
        type: 'number-range',
    },
];

export function ProductsListPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductAdminListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const statusFilter = filterValues.status as ProductStatus | undefined;
            const priceRange = filterValues.price as { min?: number; max?: number } | undefined;

            const response = await AdminProductService.searchProducts({
                name: searchQuery || undefined,
                status: statusFilter,
                minPrice: priceRange?.min,
                maxPrice: priceRange?.max,
                page: currentPage - 1,
                size: itemsPerPage,
            });
            setProducts(response.content);
            setTotalItems(response.totalElements);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Не удалось загрузить товары');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, filterValues.status, filterValues.price, searchQuery]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('Вы уверены, что хотите удалить товар?')) return;

        try {
            await AdminProductService.deleteProduct(productId);
            fetchProducts();
        } catch (err) {
            console.error('Failed to delete product:', err);
            alert('Не удалось удалить товар');
        }
    };

    const columns: Column<ProductAdminListItemDto>[] = [
        {
            key: 'photo',
            title: 'Фото',
            width: '80px',
            render: (product) => (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    {product.mainMediaUrl ? (
                        <img
                            src={product.mainMediaUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                            Нет
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'name',
            title: 'Товар',
            sortable: true,
            render: (product) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product.articleNumber || `ID: ${product.id}`}
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            title: 'Категория',
            sortable: true,
            render: (product) => product.categoryName || '—',
        },
        {
            key: 'basePrice',
            title: 'Цена',
            sortable: true,
            render: (product) => (
                <span className="font-medium">
                    {product.basePrice ? `${product.basePrice.toLocaleString()} ₽` : '—'}
                </span>
            ),
        },
        {
            key: 'promoPrice',
            title: 'Акционная',
            render: (product) =>
                product.promoPrice ? (
                    <span className="font-medium text-red-600">
                        {product.promoPrice.toLocaleString()} ₽
                    </span>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                ),
        },
        {
            key: 'totalStock',
            title: 'Наличие',
            sortable: true,
            render: (product) => `${product.totalStock} шт.`,
        },
        {
            key: 'status',
            title: 'Статус',
            render: (product) => (
                <AdminBadge variant={statusVariants[product.status]}>
                    {statusLabels[product.status]}
                </AdminBadge>
            ),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '120px',
            render: (product) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/products/${product.id}/edit`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/catalog/product/${product.id}`, '_blank');
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedIds(new Set());
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleBulkAction = (action: 'status' | 'category' | 'price' | 'delete') => {
        console.log('Bulk action:', action, 'for ids:', selectedIds);
    };

    return (
        <div>
            <AdminHeader
                title="Управление товарами"
                subtitle="Добавление / Редактирование / Удаление товаров"
                actions={
                    <AdminButton
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/admin/products/new')}
                    >
                        Добавить товар
                    </AdminButton>
                }
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button
                        onClick={fetchProducts}
                        className="ml-4 underline hover:no-underline"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AdminInput
                        placeholder="Поиск по названию, артикулу"
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
                    <AdminButton variant="outline" onClick={fetchProducts}>
                        Обновить
                    </AdminButton>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('status')}
                            >
                                Изменить статус
                            </AdminButton>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('category')}
                            >
                                Изменить категорию
                            </AdminButton>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('price')}
                            >
                                Изменить цену
                            </AdminButton>
                        </>
                    )}
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                    >
                        Экспорт в CSV
                    </AdminButton>
                </div>
            </div>

            {/* Select all checkbox label */}
            {selectedIds.size > 0 && (
                <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Выбрано: {selectedIds.size} из {products.length}
                </div>
            )}

            {/* Table */}
            <AdminTable
                columns={columns}
                data={products}
                getRowId={(product) => product.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(product) => navigate(`/admin/products/${product.id}/edit`)}
                loading={loading}
                emptyMessage="Товары не найдены"
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
