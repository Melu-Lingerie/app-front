import { useState } from 'react';
import { Pencil, Trash2, Check, EyeOff, Download, Star } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminInput,
    AdminFilters,
    AdminBadge,
    AdminSelect,
} from '../components';
import type { Column, FilterConfig } from '../components';
import type { Review, ReviewStatus } from './types';
import { mockReviews } from './mockData';

const statusLabels: Record<ReviewStatus, string> = {
    moderation: 'На модерации',
    published: 'Опубликован',
    hidden: 'Скрыт',
};

const statusVariants: Record<ReviewStatus, 'warning' | 'success' | 'error'> = {
    moderation: 'warning',
    published: 'success',
    hidden: 'error',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'category',
        label: 'По товару/категории',
        type: 'select',
        options: [
            { value: '1', label: 'Трусы' },
            { value: '2', label: 'Бюстгальтеры' },
            { value: '3', label: 'Боди' },
            { value: '4', label: 'Комплекты' },
        ],
    },
    {
        key: 'rating',
        label: 'По рейтингу (1-5 звёзд)',
        type: 'select',
        options: [
            { value: '1', label: '1 звезда' },
            { value: '2', label: '2 звёзды' },
            { value: '3', label: '3 звёзды' },
            { value: '4', label: '4 звёзды' },
            { value: '5', label: '5 звёзд' },
        ],
    },
    {
        key: 'date',
        label: 'По дате регистрации',
        type: 'date-range',
    },
    {
        key: 'photo',
        label: 'С фото/без фото',
        type: 'select',
        options: [
            { value: 'with', label: 'С фото' },
            { value: 'without', label: 'Без фото' },
        ],
    },
];

const statusSelectOptions = [
    { value: 'all', label: 'Все отзывы' },
    { value: 'moderation', label: 'На модерации' },
    { value: 'published', label: 'Опубликованные' },
    { value: 'hidden', label: 'Скрытые' },
];

export function ReviewsListPage() {
    const [reviews, setReviews] = useState<Review[]>(mockReviews);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handlePublish = (reviewId: number) => {
        setReviews((prev) =>
            prev.map((review) =>
                review.id === reviewId ? { ...review, status: 'published' as ReviewStatus } : review
            )
        );
    };

    const handleHide = (reviewId: number) => {
        setReviews((prev) =>
            prev.map((review) =>
                review.id === reviewId ? { ...review, status: 'hidden' as ReviewStatus } : review
            )
        );
    };

    const handleDelete = (reviewId: number) => {
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                    />
                ))}
            </div>
        );
    };

    const columns: Column<Review>[] = [
        {
            key: 'productName',
            title: 'Товар',
            sortable: true,
        },
        {
            key: 'reviewText',
            title: 'Отзыв',
            render: (review) => (
                <div className="max-w-xs truncate">{review.reviewText}</div>
            ),
        },
        {
            key: 'rating',
            title: 'Рейтинг',
            sortable: true,
            render: (review) => renderStars(review.rating),
        },
        {
            key: 'author',
            title: 'Автор',
            render: (review) => (
                <div>
                    <div className="text-gray-900 dark:text-gray-100">{review.authorName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {review.authorId}</div>
                </div>
            ),
        },
        {
            key: 'date',
            title: 'Дата',
            sortable: true,
        },
        {
            key: 'status',
            title: 'Статус',
            render: (review) => (
                <AdminBadge variant={statusVariants[review.status]}>
                    {statusLabels[review.status]}
                </AdminBadge>
            ),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '120px',
            render: (review) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Edit review
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(review.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                    {review.status !== 'published' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePublish(review.id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-green-600 dark:text-green-400"
                            title="Опубликовать"
                        >
                            <Check size={16} />
                        </button>
                    )}
                    {review.status !== 'hidden' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleHide(review.id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-orange-600 dark:text-orange-400"
                            title="Скрыть"
                        >
                            <EyeOff size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const filteredReviews = reviews.filter((review) => {
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            if (
                !review.productName.toLowerCase().includes(search) &&
                !review.reviewText.toLowerCase().includes(search) &&
                !review.authorName.toLowerCase().includes(search)
            ) {
                return false;
            }
        }
        if (statusFilter !== 'all' && review.status !== statusFilter) {
            return false;
        }
        return true;
    });

    const handleBulkAction = (action: 'delete' | 'hide' | 'publish') => {
        if (action === 'delete') {
            setReviews((prev) =>
                prev.filter((review) => !selectedIds.has(review.id))
            );
        } else if (action === 'hide') {
            setReviews((prev) =>
                prev.map((review) =>
                    selectedIds.has(review.id)
                        ? { ...review, status: 'hidden' as ReviewStatus }
                        : review
                )
            );
        } else if (action === 'publish') {
            setReviews((prev) =>
                prev.map((review) =>
                    selectedIds.has(review.id)
                        ? { ...review, status: 'published' as ReviewStatus }
                        : review
                )
            );
        }
        setSelectedIds(new Set());
    };

    return (
        <div>
            <AdminHeader
                title="Управление отзывами"
                subtitle="Основная таблица отзывов"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AdminInput
                        placeholder="Поиск по товару, отзыву, автору"
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
                    <AdminSelect
                        options={statusSelectOptions}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-40"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('delete')}
                            >
                                Удалить
                            </AdminButton>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('hide')}
                            >
                                Скрыть
                            </AdminButton>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('publish')}
                            >
                                Опубликовать
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

            {/* Table */}
            <AdminTable
                columns={columns}
                data={filteredReviews}
                getRowId={(review) => review.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />
        </div>
    );
}
