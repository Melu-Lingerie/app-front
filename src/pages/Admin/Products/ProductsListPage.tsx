import { useState, useMemo } from 'react';
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
import type { Product, ProductStatus } from './types';
import { mockProducts } from './mockData';

const statusLabels: Record<ProductStatus, string> = {
    active: 'В продаже',
    inactive: 'Неактивен',
    out_of_stock: 'Нет в наличии',
};

const statusVariants: Record<ProductStatus, 'success' | 'warning' | 'error'> = {
    active: 'success',
    inactive: 'warning',
    out_of_stock: 'error',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'status',
        label: 'По статусу',
        type: 'select',
        options: [
            { value: 'active', label: 'В продаже' },
            { value: 'inactive', label: 'Неактивен' },
            { value: 'out_of_stock', label: 'Нет в наличии' },
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
    const [products] = useState<Product[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const columns: Column<Product>[] = [
        {
            key: 'photo',
            title: 'Фото',
            width: '80px',
            render: (product) => (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    {product.mainImageUrl ? (
                        <img
                            src={product.mainImageUrl}
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
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {product.articleNumber}</div>
                </div>
            ),
        },
        {
            key: 'category',
            title: 'Категория',
            sortable: true,
            render: (product) => product.categoryName,
        },
        {
            key: 'basePrice',
            title: 'Цена',
            sortable: true,
            render: (product) => (
                <span className="font-medium">{product.basePrice.toLocaleString()} ₽</span>
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
            key: 'stockQuantity',
            title: 'Наличие',
            sortable: true,
            render: (product) => `${product.stockQuantity} шт.`,
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
                            // TODO: Delete product
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/catalog/${product.slug}`, '_blank');
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

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (searchQuery) {
                const search = searchQuery.toLowerCase();
                if (
                    !product.name.toLowerCase().includes(search) &&
                    !product.articleNumber.toLowerCase().includes(search)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [products, searchQuery]);

    // Пагинация
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedIds(new Set()); // Сбросить выделение при смене страницы
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Вернуться на первую страницу
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
                    Выбрано: {selectedIds.size} из {paginatedProducts.length}
                </div>
            )}

            {/* Table */}
            <AdminTable
                columns={columns}
                data={paginatedProducts}
                getRowId={(product) => product.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(product) => navigate(`/admin/products/${product.id}/edit`)}
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
