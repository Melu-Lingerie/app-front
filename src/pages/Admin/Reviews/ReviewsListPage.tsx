import { useState, useEffect, useCallback } from 'react';
import { Trash2, Check, X, Download, Star } from 'lucide-react';
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
import { getReviewStatus } from './types';
import { AdminReviewService } from '../../../api/services/AdminReviewService';

const statusLabels: Record<ReviewStatus, string> = {
    moderation: 'На модерации',
    published: 'Опубликован',
    hidden: 'Отклонён',
};

const statusVariants: Record<ReviewStatus, 'warning' | 'success' | 'error'> = {
    moderation: 'warning',
    published: 'success',
    hidden: 'error',
};

const filterConfigs: FilterConfig[] = [
    {
        key: 'rating',
        label: 'По рейтингу',
        type: 'select',
        options: [
            { value: '1', label: '1 звезда' },
            { value: '2', label: '2 звёзды' },
            { value: '3', label: '3 звёзды' },
            { value: '4', label: '4 звёзды' },
            { value: '5', label: '5 звёзд' },
        ],
    },
];

const statusSelectOptions = [
    { value: 'all', label: 'Все отзывы' },
    { value: 'moderation', label: 'На модерации' },
    { value: 'published', label: 'Опубликованные' },
    { value: 'hidden', label: 'Отклонённые' },
];

export function ReviewsListPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [pendingCount, setPendingCount] = useState(0);

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            // Map status filter to isApproved parameter
            let isApproved: boolean | undefined;
            if (statusFilter === 'published') isApproved = true;
            else if (statusFilter === 'hidden') isApproved = false;
            // 'moderation' and 'all' don't set isApproved

            const response = await AdminReviewService.searchReviews({
                search: searchQuery || undefined,
                isApproved: statusFilter === 'moderation' ? undefined : isApproved,
                page: pagination.page,
                size: pagination.size,
            });

            // For moderation filter, we need to filter client-side since API doesn't support null
            let filteredContent = response.content;
            if (statusFilter === 'moderation') {
                filteredContent = response.content.filter(r => r.isApproved === null);
            }

            setReviews(filteredContent);
            setPagination(prev => ({
                ...prev,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
            }));
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, statusFilter, pagination.page, pagination.size]);

    const fetchPendingCount = useCallback(async () => {
        try {
            const count = await AdminReviewService.countPendingReviews();
            setPendingCount(count);
        } catch (error) {
            console.error('Failed to fetch pending count:', error);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
        fetchPendingCount();
    }, [fetchReviews, fetchPendingCount]);

    const handleApprove = async (reviewId: string) => {
        try {
            await AdminReviewService.approveReview(reviewId);
            fetchReviews();
            fetchPendingCount();
        } catch (error) {
            console.error('Failed to approve review:', error);
        }
    };

    const handleReject = async (reviewId: string) => {
        try {
            await AdminReviewService.rejectReview(reviewId);
            fetchReviews();
            fetchPendingCount();
        } catch (error) {
            console.error('Failed to reject review:', error);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Вы уверены, что хотите удалить отзыв?')) return;

        try {
            await AdminReviewService.deleteReview(reviewId);
            fetchReviews();
            fetchPendingCount();
        } catch (error) {
            console.error('Failed to delete review:', error);
        }
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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU');
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
                    <div className="text-gray-900 dark:text-gray-100">{review.reviewerName}</div>
                    {review.isVerifiedPurchase && (
                        <div className="text-xs text-green-600 dark:text-green-400">Покупка подтверждена</div>
                    )}
                </div>
            ),
        },
        {
            key: 'createdAt',
            title: 'Дата',
            sortable: true,
            render: (review) => formatDate(review.createdAt),
        },
        {
            key: 'status',
            title: 'Статус',
            render: (review) => {
                const status = getReviewStatus(review);
                return (
                    <AdminBadge variant={statusVariants[status]}>
                        {statusLabels[status]}
                    </AdminBadge>
                );
            },
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '140px',
            render: (review) => {
                const status = getReviewStatus(review);
                return (
                    <div className="flex items-center gap-1">
                        {status !== 'published' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(review.id);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-green-600 dark:text-green-400"
                                title="Одобрить"
                            >
                                <Check size={16} />
                            </button>
                        )}
                        {status !== 'hidden' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(review.id);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-orange-600 dark:text-orange-400"
                                title="Отклонить"
                            >
                                <X size={16} />
                            </button>
                        )}
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
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Управление отзывами"
                subtitle={pendingCount > 0 ? `${pendingCount} на модерации` : 'Все отзывы проверены'}
            />

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <AdminInput
                        placeholder="Поиск по товару, отзыву, автору"
                        showSearchIcon
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <div className="flex items-center gap-2">
                        <AdminFilters
                            filters={filterConfigs}
                            values={filterValues}
                            onChange={(key, value) =>
                                setFilterValues((prev) => ({ ...prev, [key]: value }))
                            }
                            onClear={() => setFilterValues({})}
                        />
                        <div className="w-44 shrink-0">
                            <AdminSelect
                                options={statusSelectOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                icon={<Check size={16} />}
                            >
                                Одобрить
                            </AdminButton>
                            <AdminButton
                                variant="outline"
                                size="sm"
                                icon={<X size={16} />}
                            >
                                Отклонить
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
                data={reviews}
                getRowId={(review) => review.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                loading={isLoading}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                    <span className="text-sm text-gray-500">
                        Показано {reviews.length} из {pagination.totalElements}
                    </span>
                    <div className="flex gap-2">
                        <AdminButton
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Назад
                        </AdminButton>
                        <AdminButton
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages - 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Вперёд
                        </AdminButton>
                    </div>
                </div>
            )}
        </div>
    );
}
